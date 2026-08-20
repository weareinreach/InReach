import {
	Box,
	type ButtonProps,
	Combobox,
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
	useCombobox,
} from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { useDebouncedValue, useDisclosure } from '@mantine/hooks'
import compact from 'just-compact'
import filterObject from 'just-filter-object'
import { useTranslation } from 'next-i18next/pages'
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react'
import reactStringReplace from 'react-string-replace'

import { type ApiOutput } from '@weareinreach/api'
import { AddressVisibility } from '@weareinreach/db/enums'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { isExternal, Link } from '~ui/components/core/Link'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { useNewNotification } from '~ui/hooks/useNewNotification'
import { useOrgInfo } from '~ui/hooks/useOrgInfo'
import { Icon } from '~ui/icon'
import { cx } from '~ui/lib/cx'
import { createWktFromLatLng } from '~ui/lib/geotools'
import { trpc as api } from '~ui/lib/trpcClient'

import { AddressVisibilitySchema, FormSchema, schemaTransform } from './schema'
import classes from './styles.module.css'
import { MultiSelectPopover } from '../MultiSelectPopover'

type AutocompleteResult = ApiOutput['geo']['autocomplete']['results'][number]

const matchText = (result: string, textToMatch: string | undefined | null) => {
	if (!textToMatch) {
		return result
	}
	const matcher = new RegExp(`(${textToMatch})`, 'ig')
	return reactStringReplace(result, matcher, (match, i) => (
		<span key={i} className={classes.matchedText}>
			{match}
		</span>
	))
}

const addressVisibilityOptions: { value: AddressVisibility; label: string }[] = [
	{ value: AddressVisibility.FULL, label: 'Show full address' },
	{ value: AddressVisibility.PARTIAL, label: 'Show city & state/province' },
	{ value: AddressVisibility.HIDDEN, label: 'Hide address' },
]

const _AddressDrawer = forwardRef<HTMLButtonElement, AddressDrawerProps>(({ locationId, ...props }, ref) => {
	const [opened, handler] = useDisclosure(false)
	const [coordModalOpen, coordModalHandler] = useDisclosure(false)
	const [searchTerm, setSearchTerm] = useState<string>('')
	const [search] = useDebouncedValue(searchTerm, 200)
	const [results, setResults] = useState<ApiOutput['geo']['autocomplete']['results']>()
	const [googlePlaceId, setGooglePlaceId] = useState<string>('')
	const [isSaved, setIsSaved] = useState(false)
	const form = useForm<FormSchema>({
		validate: zodResolver(FormSchema),
		initialValues: {
			id: '',
			data: { accessible: {}, addressVisibility: AddressVisibility.FULL },
		},
		transformValues: FormSchema.transform(schemaTransform).parse,
	})
	const { id: organizationId } = useOrgInfo()
	const { t, i18n } = useTranslation(['attribute', 'gov-dist'])
	const countryTranslation = new Intl.DisplayNames(i18n.language, { type: 'region' })
	const variants = useCustomVariant()
	const apiUtils = api.useUtils()

	const notifySave = useNewNotification({ displayText: 'Saved', icon: 'success' })

	// #region Get country/gov dist selection items
	const { data: countryOptions, isSuccess: countryOptionsLoaded } =
		api.fieldOpt.govDistsByCountryNoSub.useQuery(undefined, {
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
	const govDistOptions = useMemo(() => {
		const selectedCountryId = form.values.data.countryId
		if (!selectedCountryId) {
			return []
		}
		const govDistItems =
			countryOptions?.find(({ value: countryId }) => countryId === selectedCountryId)?.govDist ?? []
		return govDistItems
	}, [countryOptions, form.values.data.countryId])

	// #endregion

	// #region Get initial address
	const { data, isLoading } = api.location.getAddress.useQuery(locationId ?? '', {
		enabled: Boolean(locationId) && countryOptionsLoaded,
		refetchOnWindowFocus: false,
		// @mantine/form's getInputProps forwards `value` straight to the DOM input - the API can
		// legitimately return `null` for any of these (no second address line, no coordinates yet,
		// etc.), which React warns about and can flip an input from controlled to uncontrolled
		// mid-edit. Coerce to the same "empty" representation used elsewhere for these fields.
		select: ({
			id,
			data: { addressVisibility, name, street1, street2, city, postCode, longitude, latitude, ...rest },
		}) => ({
			id,
			data: {
				...rest,
				name: name ?? '',
				street1: street1 ?? '',
				street2: street2 ?? '',
				city: city ?? '',
				postCode: postCode ?? '',
				longitude: longitude ?? undefined,
				latitude: latitude ?? undefined,
				addressVisibility: AddressVisibilitySchema.parse(addressVisibility),
			},
		}),
	})
	useEffect(() => {
		if (data && !isLoading) {
			const { accessible, ...restData } = data.data
			const accessibleBoolean =
				accessible?.boolean === undefined ? 'null' : accessible.boolean ? 'true' : 'false'
			// FormSchema's inferred type reflects boolOrNull's post-transform output (boolean | null),
			// but Radio.Group requires the pre-transform string values ('true' | 'false' | 'null'),
			// which boolOrNull also accepts as input and converts back to boolean | null on submit.
			const formValues = {
				...data,
				data: { ...restData, accessible: { ...accessible, boolean: accessibleBoolean } },
			} as unknown as typeof data
			form.setValues(formValues)
			form.resetDirty(formValues)
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
			apiUtils.location.invalidate()
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

	useEffect(() => {
		if (isSaved && isSaved === form.isDirty()) {
			setIsSaved(false)
		}
	}, [form, isSaved])

	// #endregion

	// #region Google autocomplete/geocoding

	const { data: autoCompleteSearch } = api.geo.autocomplete.useQuery(
		{ search, fullAddress: form.values.data.addressVisibility === AddressVisibility.FULL },
		{
			enabled: search !== '',
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
			const addressVisibility = form.values.data.addressVisibility
			const isFullAddress = addressVisibility === AddressVisibility.FULL
			const { result } = geoCodedAddress

			const country = countryOptions?.find(({ cca2 }) => cca2 === result.country)
			const govDist = country?.govDist.find(({ abbrev }) => abbrev === result.govDist)

			const formattedStreet1 =
				compact([result.streetNumber, result.streetName]).length === 2
					? compact([result.streetNumber, result.streetName]).join(' ')
					: undefined
			const valuesToSet = {
				...(isFullAddress && {
					street1: formattedStreet1,
					street2: result.street2,
				}),
				city: result.city,
				postCode: isFullAddress ? result.postCode : null,
				...(country && { countryId: country.value }),
				...(govDist && { govDistId: govDist.value }),
				latitude: result.geometry.location.lat,
				longitude: result.geometry.location.lng,
				geoWKT: createWktFromLatLng({
					latitude: result.geometry.location.lat,
					longitude: result.geometry.location.lng,
				}),
			}

			form.setValues({
				id: form.values.id,
				data: {
					...form.values.data,
					...valuesToSet,
				},
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [geoCodedAddress])

	const getGoogleMapCheckDistanceURL = useCallback(
		(formValues: typeof form.values) => {
			const origin = compact([
				formValues.data.street1,
				formValues.data.street2,
				formValues.data.city,
				govDistOptions.find(({ value }) => value === formValues.data.govDistId)?.label,
				formValues.data.postCode,
				countryOptions?.find(({ value }) => value === formValues.data.countryId)?.label,
			]).join(', ')

			const destination = [formValues.data.latitude, formValues.data.longitude].join(',')

			const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURI(origin)}&destination=${encodeURI(
				destination
			)}&travelmode=walking`
			return url
		},
		[countryOptions, form, govDistOptions]
	)
	const gMapCheckDistance = getGoogleMapCheckDistanceURL(form.values)
	// #endregion

	// #region Dropdown item components/handling

	const handleAutocompleteSelection = useCallback(
		(item: AutocompleteResult) => {
			if (!item.placeId) {
				return
			}
			setGooglePlaceId(item.placeId)
		},
		[setGooglePlaceId]
	)

	const countryNotSelected = !form.values.data.countryId || form.values.data.countryId === ''

	// Only one of Street1Input/CityInput ever renders an autocomplete field at a time (they're
	// mutually exclusive on `addressVisibility`), so a single Combobox store covers both.
	const addressCombobox = useCombobox({
		onDropdownClose: () => addressCombobox.resetSelectedOption(),
	})

	const renderAddressAutocomplete = useCallback(
		(fieldName: 'data.street1' | 'data.city', fieldLabel: string, fieldRequired: boolean) => {
			const { value, onChange, ...fieldProps } = form.getInputProps(fieldName)
			return (
				<Combobox
					store={addressCombobox}
					onOptionSubmit={(optionValue) => {
						const item = (results ?? []).find((result) => result.value === optionValue)
						if (item) {
							handleAutocompleteSelection(item)
							form.setFieldValue(fieldName, item.value)
						}
						addressCombobox.closeDropdown()
					}}
				>
					<Combobox.Target>
						<TextInput
							label={fieldLabel}
							required={fieldRequired}
							disabled={countryNotSelected}
							value={value ?? ''}
							{...fieldProps}
							onChange={(event) => {
								const val = event.currentTarget.value
								onChange(val)
								setSearchTerm(val)
								addressCombobox.openDropdown()
							}}
							onFocus={() => addressCombobox.openDropdown()}
							onBlur={() => addressCombobox.closeDropdown()}
						/>
					</Combobox.Target>
					<Combobox.Dropdown>
						<Combobox.Options>
							{(results ?? []).map((item) => (
								<Combobox.Option value={item.value} key={item.value}>
									<Text className={classes.unmatchedText} truncate>
										{matchText(item.value, value)}
									</Text>
									<Text className={cx(classes.unmatchedText, classes.secondLine)} truncate>
										{item.subheading}
									</Text>
								</Combobox.Option>
							))}
						</Combobox.Options>
					</Combobox.Dropdown>
				</Combobox>
			)
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[addressCombobox, results, handleAutocompleteSelection, countryNotSelected]
	)

	// #endregion
	const addressFieldRequired = form.values.data.addressVisibility === AddressVisibility.FULL

	const Street1Input =
		form.values.data.addressVisibility === AddressVisibility.FULL ? (
			renderAddressAutocomplete('data.street1', 'Address', addressFieldRequired)
		) : (
			<TextInput label='Address' disabled={countryNotSelected} {...form.getInputProps('data.street1')} />
		)

	const CityInput =
		form.values.data.addressVisibility === AddressVisibility.FULL ? (
			<TextInput label='City' required disabled={countryNotSelected} {...form.getInputProps('data.city')} />
		) : (
			renderAddressAutocomplete('data.city', 'City', true)
		)

	return (
		<>
			<Drawer.Root onClose={handler.close} opened={opened} position='right'>
				<Drawer.Overlay />
				<Drawer.Content className={classes.drawerContent}>
					<Drawer.Header>
						<Group wrap='nowrap' justify='space-between' w='100%'>
							<Breadcrumb option='close' onClick={handler.close} />
							<Button
								variant='primary-icon'
								leftIcon={<Icon icon={isSaved ? 'carbon:checkmark' : 'carbon:save'} />}
								onClick={handleUpdate}
								loading={updateLocation.isPending}
								disabled={!form.isDirty()}
							>
								Save
							</Button>
						</Group>
					</Drawer.Header>
					<Drawer.Body className={classes.drawerBody}>
						<Stack gap={24} align='center'>
							<Title order={2}>Edit Location</Title>
							<TextInput label='Name' required {...form.getInputProps('data.name')} />
							<Stack w='100%'>
								<Stack gap={0} w='100%'>
									<Select
										label='Address visibility'
										data={addressVisibilityOptions}
										{...form.getInputProps('data.addressVisibility')}
									/>
								</Stack>
								<Stack gap={0}>
									<Select
										label='Country'
										data={countryOptions ?? []}
										renderOption={({ option }) => {
											const country = countryOptions?.find(({ value }) => value === option.value)
											return <Text>{`${country?.flag ?? ''} ${option.label}`}</Text>
										}}
										required
										searchable
										styles={{ dropdown: { width: 'fit-content !important' } }}
										{...form.getInputProps('data.countryId')}
									/>
									{Street1Input}
									<TextInput disabled={countryNotSelected} {...form.getInputProps('data.street2')} />
								</Stack>
								<Group wrap='nowrap'>{CityInput}</Group>
								<Group wrap='nowrap'>
									<Select
										label='State'
										data={govDistOptions}
										required={Boolean(govDistOptions.length)}
										disabled={!govDistOptions.length || countryNotSelected}
										searchable
										styles={{ dropdown: { width: 'fit-content !important' } }}
										{...form.getInputProps('data.govDistId')}
									/>
									<TextInput
										label='Postal code'
										required={addressFieldRequired}
										disabled={countryNotSelected}
										{...form.getInputProps('data.postCode')}
									/>
								</Group>
								<Stack gap={0}>
									<Group wrap='nowrap'>
										<TextInput
											required
											label='Latitude'
											disabled={countryNotSelected}
											{...form.getInputProps('data.latitude')}
										/>
										<TextInput
											required
											label='Longitude'
											disabled={countryNotSelected}
											{...form.getInputProps('data.longitude')}
										/>
									</Group>
									{isExternal(gMapCheckDistance) && (
										<Link external href={gMapCheckDistance}>
											<Group wrap='nowrap' gap={8}>
												<Icon icon='carbon:launch' />
												<Text variant={variants.Text.utility3}>Check distance to address on Google Map</Text>
											</Group>
										</Link>
									)}
								</Stack>
								<Divider />
								<Radio.Group
									label='Is this location wheelchair accessible?'
									size='xs'
									{...form.getInputProps('data.accessible.boolean')}
								>
									<Group wrap='nowrap'>
										<Radio value='true' label='Accessible' classNames={{ label: classes.radioLabel }} />
										<Radio value='false' label='Not accessible' classNames={{ label: classes.radioLabel }} />
										<Radio value='null' label='No info' classNames={{ label: classes.radioLabel }} />
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
