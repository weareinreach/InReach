import { zodResolver } from '@hookform/resolvers/zod'
import {
	type AutocompleteItem,
	Box,
	type ButtonProps,
	createPolymorphicComponent,
	Divider,
	Drawer,
	Group,
	Modal,
	Stack,
	Text,
	Title,
} from '@mantine/core'
import { useDebouncedValue, useDisclosure } from '@mantine/hooks'
import compact from 'just-compact'
import filterObject from 'just-filter-object'
import { useTranslation } from 'next-i18next'
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Autocomplete, Radio, Select, TextInput } from 'react-hook-form-mantine'

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
import { CountryItem } from './CountryItem'
import { AddressVisibilitySchema, FormSchema, schemaTransform } from './schema'
import { useStyles } from './styles'
import { MultiSelectPopover } from '../MultiSelectPopover/hook-form'

// TODO: ensure it works like it's supposed to.. so far this has just been a quick 'n dirty.

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
	const [googlePlaceId, setGooglePlaceId] = useState<string>('')
	const [isSaved, setIsSaved] = useState(false)
	const [searchFullAddress, setSearchFullAddress] = useState(true)
	const { id: organizationId } = useOrgInfo()
	const { t, i18n } = useTranslation(['attribute', 'gov-dist'])
	const countryTranslation = new Intl.DisplayNames(i18n.language, { type: 'region' })
	const { classes } = useStyles()
	const variants = useCustomVariant()
	const apiUtils = api.useUtils()
	// #region Get country/gov dist selection items
	const { data: countryOptions } = api.fieldOpt.govDistsByCountryNoSub.useQuery(undefined, {
		refetchOnWindowFocus: false,
		select: (result) =>
			result.map(({ id, flag, cca2, govDist }) => ({
				flag,
				cca2,
				value: id,
				label: countryTranslation.of(cca2) ?? cca2,
				govDist: govDist.map(({ id: govDistId, tsKey, tsNs, abbrev }) => ({
					label: t(tsKey, { ns: tsNs }),
					value: govDistId,
					abbrev,
				})),
			})),
	})
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

	// #region Get initial address
	const { data, isLoading } = api.location.getAddress.useQuery(locationId ?? '', {
		enabled: Boolean(locationId) && Boolean(countryOptions?.length),
		refetchOnWindowFocus: false,
		select: ({ id, data: { addressVisibility, ...rest } }) => ({
			id,
			data: {
				...rest,
				addressVisibility: AddressVisibilitySchema.parse(addressVisibility),
			},
		}),
	})
	// useEffect(() => {
	// 	if (data && !isLoading) {
	// 		form.setValues(data)
	// 		form.resetDirty()
	// 		setIsSaved(false)
	// 	}
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [data, isLoading])
	// // #endregion

	const form = useForm<FormSchema>({
		resolver: zodResolver(FormSchema),
		values: data,
		defaultValues: {},
		// transformValues: FormSchema.transform(schemaTransform).parse,
	})
	const selectedCountryId = form.watch('data.countryId')
	const selectedAddressVisibility = form.watch('data.addressVisibility')

	const govDistOptions = useMemo(() => {
		if (!selectedCountryId) {
			return []
		}
		const govDistItems =
			countryOptions?.find(({ value: countryId }) => countryId === selectedCountryId)?.govDist ?? []
		return govDistItems
	}, [countryOptions, selectedCountryId])

	const notifySave = useNewNotification({ displayText: 'Saved', icon: 'success' })
	const notifyCoordUpdate = useCoordNotification()

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
		const changesOnly = filterObject(
			form.getValues().data,
			(key) => form.getFieldState(`data.${key}`).isDirty
		)

		updateLocation.mutate(
			FormSchema.transform(schemaTransform).parse({ id: form.getValues().id, data: changesOnly })
		)
	}, [form, updateLocation])

	const setCoordsToFullAddress = useCallback(
		async (formHook: typeof form) => {
			const {
				data: { street1, street2, city },
			} = formHook.getValues()
			if (!street1 || street1 === '') {
				coordModalHandler.open()
			}
			const searchTerms = [street1, street2, city].filter(Boolean).join(', ')
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
			const {
				data: { city, countryId, govDistId },
			} = formHook.getValues()
			if (city) {
				const { results: cityResults } = await apiUtils.geo.cityCoords.fetch({
					city,
					country: countryId ?? US_COUNTRY_ID,
					govDist: govDistId,
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
		if (isSaved && isSaved === form.formState.isDirty) {
			setIsSaved(false)
		}
		const fullAddressSearchNeeded = shouldSearchFullAddress({
			addressVisibility: form.getValues()?.data?.addressVisibility,
			isDirty: form.formState.isDirty,
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
			const country = countryOptions?.find(({ cca2 }) => cca2 === result.country)
			const govDist = country?.govDist.find(({ abbrev }) => abbrev === result.govDist)

			const formattedStreet1 =
				compact([result.streetNumber, result.streetName]).length === 2
					? compact([result.streetNumber, result.streetName]).join(' ')
					: undefined

			if (selectedAddressVisibility === PrismaEnums.AddressVisibility.FULL) {
				form.setValue('data.street1', formattedStreet1)
				form.setValue('data.street2', result.street2)
				form.setValue('data.city', result.city)
				form.setValue('data.postCode', result.postCode)
				if (country) {
					form.setValue('data.countryId', country.value)
				}
				if (govDist) {
					form.setValue('data.govDistId', govDist.value)
				}
				form.setValue('data.latitude', result.geometry.location.lat)
				form.setValue('data.longitude', result.geometry.location.lng)
				form.setValue(
					'data.geoWKT',
					createWktFromLatLng({
						latitude: result.geometry.location.lat,
						longitude: result.geometry.location.lng,
					})
				)
			} else {
				form.setValue('data.latitude', result.geometry.location.lat)
				form.setValue('data.longitude', result.geometry.location.lng)
				form.setValue(
					'data.geoWKT',
					createWktFromLatLng({
						latitude: result.geometry.location.lat,
						longitude: result.geometry.location.lng,
					})
				)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [geoCodedAddress])

	const getGoogleMapCheckDistanceURL = useCallback(
		(hookForm: typeof form) => {
			const currentFormValues = hookForm.getValues()
			if (!currentFormValues || !('data' in currentFormValues)) {
				return ''
			}

			const {
				data: { street1, street2, city, postCode, countryId, govDistId, latitude, longitude },
			} = currentFormValues
			const country = countryOptions?.find(({ value }) => value === countryId)
			const govDist = country?.govDist.find(({ value }) => value === govDistId)
			const origin = compact([street1, street2, city, govDist?.label, postCode, country?.label]).join(', ')

			const destination = [latitude, longitude].join(',')

			const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURI(origin)}&destination=${encodeURI(
				destination
			)}&travelmode=walking`
			return url
		},
		[countryOptions]
	)
	const gMapCheckDistance = getGoogleMapCheckDistanceURL(form)
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

	// #endregion

	return (
		<>
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
								disabled={!form.formState.isDirty}
							>
								Save
							</Button>
						</Group>
					</Drawer.Header>
					<Drawer.Body className={classes.drawerBody}>
						<Stack spacing={24} align='center'>
							<Title order={2}>Edit Location</Title>
							<TextInput label='Name' required control={form.control} name='data.name' />
							<Stack w='100%'>
								<Stack spacing={0} w='100%'>
									<Select
										label='Address visibility'
										data={addressVisibilityOptions}
										defaultValue={PrismaEnums.AddressVisibility.FULL}
										control={form.control}
										name='data.addressVisibility'
									/>
								</Stack>
								<Stack spacing={0}>
									<Autocomplete
										itemComponent={AutoCompleteItem}
										data={results ?? []}
										label='Address'
										withinPortal
										onItemSubmit={handleAutocompleteSelection}
										control={form.control}
										name='data.street1'
										onChange={setSearchTerm}
									/>
									<TextInput control={form.control} name='data.street2' />
								</Stack>
								<Group noWrap>
									<TextInput label='City' required control={form.control} name='data.city' />
									<Select
										label='State'
										data={govDistOptions}
										required={Boolean(govDistOptions.length)}
										disabled={!govDistOptions.length}
										searchable
										withinPortal
										styles={{ dropdown: { width: 'fit-content !important' } }}
										control={form.control}
										name='data.govDistId'
									/>
								</Group>
								<Group noWrap>
									<Select
										label='Country'
										data={countryOptions ?? []}
										itemComponent={CountryItem}
										required
										withinPortal
										searchable
										styles={{ dropdown: { width: 'fit-content !important' } }}
										control={form.control}
										name='data.countryId'
									/>
									<TextInput
										label='Postal code'
										required
										control={form.control}
										name='data.postCode'
										disabled={!selectedCountryId}
									/>
								</Group>
								<Stack spacing={0}>
									<Group noWrap>
										<TextInput label='Latitude' control={form.control} name='data.latitude' />
										<TextInput label='Longitude' control={form.control} name='data.longitude' />
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
									control={form.control}
									name='data.accessible.boolean'
								>
									<Group noWrap>
										<Radio.Item
											value='true'
											label='Accessible'
											classNames={{ label: classes.radioLabel, radio: classes.radioButton }}
										/>
										<Radio.Item
											value='false'
											label='Not accessible'
											classNames={{ label: classes.radioLabel, radio: classes.radioButton }}
										/>
										<Radio.Item
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
								data={orgServices ?? []}
								fullWidth
								control={form.control}
								name='data.services'
							/>
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
		</>
	)
})
_AddressDrawer.displayName = 'AddressDrawer'
export const AddressDrawer = createPolymorphicComponent<'button', AddressDrawerProps>(_AddressDrawer)

interface AddressDrawerProps extends ButtonProps {
	locationId?: string
}
