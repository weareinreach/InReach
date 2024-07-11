import {
	Autocomplete,
	type AutocompleteItem,
	Box,
	type ButtonProps,
	Checkbox,
	createPolymorphicComponent,
	Divider,
	Drawer,
	Group,
	Modal,
	Radio,
	Select,
	Stack,
	Text,
	TextInput,
	Title,
} from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { useDebouncedValue, useDisclosure } from '@mantine/hooks'
import compact from 'just-compact'
import filterObject from 'just-filter-object'
import { useTranslation } from 'next-i18next'
import { forwardRef, useCallback, useEffect, useState } from 'react'

import { type ApiOutput } from '@weareinreach/api'
import * as PrismaEnums from '@weareinreach/db/enums'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { isExternal, Link } from '~ui/components/core/Link'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { useNewNotification } from '~ui/hooks/useNewNotification'
import { useOrgInfo } from '~ui/hooks/useOrgInfo'
import { Icon } from '~ui/icon'
import { createWktFromLatLng } from '~ui/lib/geotools'
import { trpc as api } from '~ui/lib/trpcClient'

import { AutoCompleteItem } from './AutocompleteItem'
import { FormContext } from './context'
import { CountryItem, type CountryItemProps } from './CountryItem'
import { AddressVisibilitySchema, FormSchema, schemaTransform } from './schema'
import { useStyles } from './styles'
import { MultiSelectPopover } from '../MultiSelectPopover'

const US_COUNTRY_ID = 'ctry_01GW2HHDK9M26M80SG63T21SVH'

const addressVisibilityOptions: { value: PrismaEnums.AddressVisibility; label: string }[] = [
	{ value: PrismaEnums.AddressVisibility.FULL, label: 'Show full address' },
	{ value: PrismaEnums.AddressVisibility.PARTIAL, label: 'Show city & state/province' },
	{ value: PrismaEnums.AddressVisibility.HIDDEN, label: 'Hide address' },
]

const useCoordNotification = () => ({
	address: useNewNotification({ displayText: 'Lat/Lon set to address', icon: 'info' }),
	city: useNewNotification({ displayText: 'Lat/Lon set to city center', icon: 'info' }),
})
const shouldSearchFullAddress = ({
	addressVisibility,
	isDirty,
	searchFullAddress,
}: {
	addressVisibility?: PrismaEnums.AddressVisibility
	isDirty: boolean
	searchFullAddress: boolean
}) => {
	if (!isDirty) {
		return null
	}
	if (addressVisibility === PrismaEnums.AddressVisibility.FULL && !searchFullAddress) {
		return true
	}
	if (
		addressVisibility !== undefined &&
		addressVisibility !== PrismaEnums.AddressVisibility.FULL &&
		searchFullAddress
	) {
		return false
	}
	return null
}
const _AddressDrawer = forwardRef<HTMLButtonElement, AddressDrawerProps>(({ locationId, ...props }, ref) => {
	const [opened, handler] = useDisclosure(false)
	const [coordModalOpen, coordModalHandler] = useDisclosure(false)
	const [searchTerm, setSearchTerm] = useState<string>('')
	const [search] = useDebouncedValue(searchTerm, 200)
	const [results, setResults] = useState<ApiOutput['geo']['autocomplete']['results']>()
	const [govDistOpts, setGovDistOpts] = useState<{ value: string; label: string }[]>([])
	const [countryOpts, setCountryOpts] = useState<CountryItemProps[]>([])
	const [googlePlaceId, setGooglePlaceId] = useState<string>('')
	const [isSaved, setIsSaved] = useState(false)
	const [searchFullAddress, setSearchFullAddress] = useState(true)
	const form = useForm<FormSchema>({
		validate: zodResolver(FormSchema),
		initialValues: {
			id: '',
			data: { accessible: {}, addressVisibility: PrismaEnums.AddressVisibility.FULL },
		},
		transformValues: FormSchema.transform(schemaTransform).parse,
	})
	const { id: organizationId } = useOrgInfo()
	const { t, i18n } = useTranslation(['attribute', 'gov-dist'])
	const countryTranslation = new Intl.DisplayNames(i18n.language, { type: 'region' })
	const { classes } = useStyles()
	const variants = useCustomVariant()
	const apiUtils = api.useUtils()

	const notifySave = useNewNotification({ displayText: 'Saved', icon: 'success' })
	const notifyCoordUpdate = useCoordNotification()

	// #region Get country/gov dist selection items
	const { data: govDistsByCountry } = api.fieldOpt.govDistsByCountryNoSub.useQuery(undefined, {
		refetchOnWindowFocus: false,
	})

	useEffect(() => {
		if (govDistsByCountry) {
			setCountryOpts(
				govDistsByCountry.map(({ id, flag, cca2 }) => ({
					flag,
					value: id,
					label: countryTranslation.of(cca2) ?? cca2,
				}))
			)
			if (!form.values?.data?.countryId) {
				form.setFieldValue('data.country', govDistsByCountry.find(({ cca2 }) => cca2 === 'US')?.id)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [govDistsByCountry])
	useEffect(() => {
		if (govDistsByCountry && form.values?.data?.countryId) {
			const dists = govDistsByCountry.find(({ id }) => id === form.values.data.countryId)?.govDist
			setGovDistOpts(
				dists?.map(({ id, tsKey, tsNs }) => ({ label: t(tsKey, { ns: tsNs }), value: id })) ?? []
			)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.values?.data?.countryId])
	// #endregion

	// #region Get initial address
	const { data, isLoading } = api.location.getAddress.useQuery(locationId ?? '', {
		enabled: Boolean(locationId) && Boolean(govDistsByCountry?.length),
		refetchOnWindowFocus: false,
		select: ({ id, data: { addressVisibility, ...rest } }) => ({
			id,
			data: {
				...rest,
				addressVisibility: AddressVisibilitySchema.parse(addressVisibility),
			},
		}),
	})
	useEffect(() => {
		if (data && !isLoading) {
			form.setValues(data)
			form.resetDirty()
			setIsSaved(false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, isLoading])
	// #endregion

	// #region Get org's services
	const { data: orgServices } = api.service.getNames.useQuery(
		{ organizationId: organizationId ?? '' },
		{
			select: (returnedData) =>
				returnedData.map(({ id, defaultText }) => ({ value: id, label: defaultText })),
			enabled: Boolean(organizationId),
			refetchOnWindowFocus: false,
		}
	)
	// #endregion

	// #region Mutation handling
	const updateLocation = api.location.update.useMutation({
		onSuccess: () => {
			apiUtils.location.getAddress.invalidate(locationId ?? '')
			setIsSaved(true)
			notifySave()
			setTimeout(() => handler.close(), 500)
		},
	})
	const handleUpdate = useCallback(() => {
		const changesOnly = filterObject(form.values.data, (key) => form.isDirty(`data.${key}`))

		updateLocation.mutate(
			FormSchema.transform(schemaTransform).parse({ id: form.values.id, data: changesOnly })
		)
	}, [form, updateLocation])

	const setCoordsToFullAddress = useCallback(
		async (formHook: typeof form) => {
			if (!formHook.values.data.street1 || formHook.values.data.street1 === '') {
				coordModalHandler.open()
			}
			const searchTerms = [
				formHook.values.data.street1,
				formHook.values.data.street2,
				formHook.values.data.city,
			]
				.filter(Boolean)
				.join(', ')
			const { results: autocompleteResults } = await apiUtils.geo.autocomplete.fetch({
				search: searchTerms,
				fullAddress: true,
			})
			const placeId =
				autocompleteResults.length >= 1 && autocompleteResults.at(0)?.placeId
					? autocompleteResults.at(0)?.placeId
					: undefined
			if (placeId) {
				setGooglePlaceId(placeId)
			} else {
				coordModalHandler.open()
			}
			notifyCoordUpdate.address()
		},
		[apiUtils, coordModalHandler, notifyCoordUpdate]
	)

	const setCoordsToCityCenter = useCallback(
		async (formHook: typeof form) => {
			if (formHook.values.data.city) {
				const { results: cityResults } = await apiUtils.geo.cityCoords.fetch({
					city: formHook.values.data.city,
					country: formHook.values.data.countryId ?? US_COUNTRY_ID,
					govDist: formHook.values.data.govDistId,
				})
				if (cityResults && !Array.isArray(cityResults)) {
					const { place_id } = cityResults
					setGooglePlaceId(place_id)
				}
			}
			notifyCoordUpdate.city()
		},
		[apiUtils, notifyCoordUpdate]
	)

	useEffect(() => {
		if (isSaved && isSaved === form.isDirty()) {
			setIsSaved(false)
		}
		const fullAddressSearchNeeded = shouldSearchFullAddress({
			addressVisibility: form.values.data.addressVisibility,
			isDirty: form.isDirty(),
			searchFullAddress,
		})
		if (fullAddressSearchNeeded !== null) {
			if (fullAddressSearchNeeded) {
				setSearchFullAddress(true)
				setCoordsToFullAddress(form)
			} else {
				setSearchFullAddress(false)
				setCoordsToCityCenter(form)
			}
		}
	}, [form, isSaved, searchFullAddress, setCoordsToCityCenter, setCoordsToFullAddress])

	// #endregion

	// #region Google autocomplete/geocoding

	const { data: autoCompleteSearch } = api.geo.autocomplete.useQuery(
		{ search, fullAddress: true },
		{
			enabled: search !== '' && searchFullAddress,
			refetchOnWindowFocus: false,
		}
	)

	useEffect(() => {
		if (autoCompleteSearch?.results.length) {
			setResults(autoCompleteSearch.results)
		}
	}, [autoCompleteSearch])

	const { data: geoCodedAddress } = api.geo.geoByPlaceId.useQuery(googlePlaceId, {
		enabled: googlePlaceId !== '',
		refetchOnWindowFocus: false,
	})
	useEffect(() => {
		if (geoCodedAddress?.result) {
			const { result } = geoCodedAddress
			const country = govDistsByCountry?.find(({ cca2 }) => cca2 === result.country)
			const govDist = country?.govDist.find(({ abbrev }) => abbrev === result.govDist)

			const formattedStreet1 =
				compact([result.streetNumber, result.streetName]).length === 2
					? compact([result.streetNumber, result.streetName]).join(' ')
					: undefined

			if (form.values.data.addressVisibility === PrismaEnums.AddressVisibility.FULL) {
				form.setValues({
					id: form.values.id,
					data: {
						...form.values.data,
						street1: formattedStreet1,
						street2: result.street2,
						city: result.city,
						postCode: result.postCode,
						...(country ? { countryId: country.id } : {}),
						...(govDist ? { govDistId: govDist.id } : {}),
						latitude: result.geometry.location.lat,
						longitude: result.geometry.location.lng,
						geoWKT: createWktFromLatLng({
							latitude: result.geometry.location.lat,
							longitude: result.geometry.location.lng,
						}),
					},
				})
			} else {
				form.setValues({
					id: form.values.id,
					data: {
						...form.values.data,
						latitude: result.geometry.location.lat,
						longitude: result.geometry.location.lng,
						geoWKT: createWktFromLatLng({
							latitude: result.geometry.location.lat,
							longitude: result.geometry.location.lng,
						}),
					},
				})
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [geoCodedAddress])

	const getGoogleMapCheckDistanceURL = useCallback(
		(formValues: typeof form.values) => {
			const origin = compact([
				formValues.data.street1,
				formValues.data.street2,
				formValues.data.city,
				govDistOpts.find(({ value }) => value === formValues.data.govDistId)?.label,
				formValues.data.postCode,
				countryOpts.find(({ value }) => value === formValues.data.countryId)?.label,
			]).join(', ')

			const destination = [formValues.data.latitude, formValues.data.longitude].join(',')

			const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURI(origin)}&destination=${encodeURI(
				destination
			)}&travelmode=walking`
			return url
		},
		[countryOpts, form, govDistOpts]
	)
	const gMapCheckDistance = getGoogleMapCheckDistanceURL(form.values)
	// #endregion

	// #region Dropdown item components/handling

	const handleAutocompleteSelection = useCallback(
		(item: AutocompleteItem) => {
			if (!item.placeId) {
				return
			}
			setGooglePlaceId(item.placeId)
		},
		[setGooglePlaceId]
	)

	const handleAutocompleteChange = useCallback(
		(val: string) => {
			setSearchTerm(val)
			form.getInputProps('data.street1').onChange(val)
		},
		[setSearchTerm, form]
	)

	// #endregion

	return (
		<FormContext.Provider value={form}>
			<Drawer.Root onClose={handler.close} opened={opened} position='right'>
				<Drawer.Overlay />
				<Drawer.Content className={classes.drawerContent}>
					<Drawer.Header>
						<Group noWrap position='apart' w='100%'>
							<Breadcrumb option='close' onClick={handler.close} />
							<Button
								variant='primary-icon'
								leftIcon={<Icon icon={isSaved ? 'carbon:checkmark' : 'carbon:save'} />}
								onClick={handleUpdate}
								loading={updateLocation.isLoading}
								disabled={!form.isDirty()}
							>
								Save
							</Button>
						</Group>
					</Drawer.Header>
					<Drawer.Body className={classes.drawerBody}>
						<Stack spacing={24} align='center'>
							<Title order={2}>Edit Location</Title>
							<TextInput label='Name' required {...form.getInputProps('data.name')} />
							<Stack w='100%'>
								<Stack spacing={0} w='100%'>
									<Select
										label='Address visibility'
										data={addressVisibilityOptions}
										defaultValue={PrismaEnums.AddressVisibility.FULL}
										{...form.getInputProps('data.addressVisibility')}
									/>
								</Stack>
								<Stack spacing={0}>
									<Autocomplete
										itemComponent={AutoCompleteItem}
										data={results ?? []}
										label='Address'
										withinPortal
										onItemSubmit={handleAutocompleteSelection}
										{...form.getInputProps('data.street1')}
										onChange={handleAutocompleteChange}
									/>
									<TextInput {...form.getInputProps('data.street2')} />
								</Stack>
								<Group noWrap>
									<TextInput label='City' required {...form.getInputProps('data.city')} />
									<Select
										label='State'
										data={govDistOpts}
										required={Boolean(govDistOpts.length)}
										disabled={!govDistOpts.length}
										searchable
										withinPortal
										styles={{ dropdown: { width: 'fit-content !important' } }}
										{...form.getInputProps('data.govDistId')}
									/>
								</Group>
								<Group noWrap>
									<Select
										label='Country'
										data={countryOpts}
										itemComponent={CountryItem}
										required
										withinPortal
										searchable
										styles={{ dropdown: { width: 'fit-content !important' } }}
										{...form.getInputProps('data.countryId')}
									/>
									<TextInput
										label='Postal code'
										required
										{...form.getInputProps('data.postCode')}
										disabled={!form.values?.data?.countryId}
									/>
								</Group>
								<Stack spacing={0}>
									<Group noWrap>
										<TextInput label='Latitude' {...form.getInputProps('data.latitude')} />
										<TextInput label='Longitude' {...form.getInputProps('data.longitude')} />
									</Group>
									{isExternal(gMapCheckDistance) && (
										<Link external href={gMapCheckDistance}>
											<Group noWrap spacing={8}>
												<Icon icon='carbon:launch' />
												<Text variant={variants.Text.utility3}>Check distance to address on Google Map</Text>
											</Group>
										</Link>
									)}
								</Stack>
								<Divider />
								<Radio.Group
									label='Is this location wheelchair accessible?'
									{...form.getInputProps('data.accessible.boolean')}
								>
									<Group noWrap>
										<Radio
											value='true'
											label='Accessible'
											classNames={{ label: classes.radioLabel, radio: classes.radioButton }}
										/>
										<Radio
											value='false'
											label='Not accessible'
											classNames={{ label: classes.radioLabel, radio: classes.radioButton }}
										/>
										<Radio
											value='null'
											label='No info'
											classNames={{ label: classes.radioLabel, radio: classes.radioButton }}
										/>
									</Group>
								</Radio.Group>
							</Stack>
							<Divider w='100%' />
							<MultiSelectPopover
								label='Services available'
								data={orgServices}
								fullWidth
								{...form.getInputProps('data.services')}
							/>

							<Stack spacing={0} w='100%'>
								<Text variant={variants.Text.utility1}>Mailing address only?</Text>
								<Checkbox
									label={'This is NOT a physical location'}
									classNames={{ label: classes.radioLabel }}
									{...form.getInputProps('data.mailOnly', { type: 'checkbox' })}
								/>
							</Stack>
						</Stack>
					</Drawer.Body>
				</Drawer.Content>
			</Drawer.Root>
			<Modal opened={coordModalOpen} onClose={coordModalHandler.close}>
				<Stack>
					<Text>Please ensure that the full address is correct to get the correct coordinates</Text>
					<Button onClick={coordModalHandler.close}>Close</Button>
				</Stack>
			</Modal>

			<Stack>
				<Box component='button' onClick={handler.open} ref={ref} {...props} />
			</Stack>
		</FormContext.Provider>
	)
})
_AddressDrawer.displayName = 'AddressDrawer'
export const AddressDrawer = createPolymorphicComponent<'button', AddressDrawerProps>(_AddressDrawer)

interface AddressDrawerProps extends ButtonProps {
	locationId?: string
}
