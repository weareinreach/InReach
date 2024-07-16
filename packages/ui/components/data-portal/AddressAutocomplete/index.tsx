import { createStyles, Group, Stack, Text } from '@mantine/core'
import { useDebouncedValue, usePrevious } from '@mantine/hooks'
import compact from 'just-compact'
import { useTranslation } from 'next-i18next'
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react'
import {
	type FieldPathValue,
	type FieldValues,
	type Path,
	type UseControllerProps,
	useFormContext,
	useWatch,
} from 'react-hook-form'
import { Autocomplete, Select, TextInput } from 'react-hook-form-mantine'
import reactStringReplace from 'react-string-replace'
import invariant from 'tiny-invariant'

import { AddressVisibility } from '@weareinreach/db/enums'
import { AddressVisibilitySchema } from '~ui/components/data-portal/AddressDrawer/schema'
import { createWktFromLatLng } from '~ui/lib/geotools'
import { trpc as api } from '~ui/lib/trpcClient'

const useStyles = createStyles((theme) => ({
	matchedText: {
		color: theme.other.colors.secondary.black,
	},
	unmatchedText: {
		...theme.other.utilityFonts.utility2,
		color: theme.other.colors.secondary.darkGray,
		display: 'block',
	},
	secondLine: { ...theme.other.utilityFonts.utility4, color: theme.other.colors.secondary.darkGray },
}))

const matchText = (
	result: string,
	textToMatch: string | undefined | null,
	classes: ReturnType<typeof useStyles>['classes']
) => {
	if (!textToMatch) {
		return result
	}
	const matcher = new RegExp(`(${textToMatch})`, 'ig')
	const replaced = reactStringReplace(result, matcher, (match, i) => (
		<span key={i} className={classes.matchedText}>
			{match}
		</span>
	))
	return replaced
}

const AutoCompleteItem = forwardRef<HTMLDivElement, AutocompleteItem>(
	({ value, subheading, placeId: _placeId, ...others }: AutocompleteItem, ref) => {
		const { classes, cx } = useStyles()
		const form = useFormContext()
		if (!form) {
			return null
		}
		return (
			<div ref={ref} {...others}>
				<Text className={classes.unmatchedText} truncate>
					{matchText(value, form.getValues()?.address?.street1 ?? '', classes)}
				</Text>
				<Text className={cx(classes.unmatchedText, classes.secondLine)} truncate>
					{subheading}
				</Text>
			</div>
		)
	}
)
AutoCompleteItem.displayName = 'AutoCompleteItem'

const CountryItem = forwardRef<HTMLDivElement, CountryItem>(({ label, flag, ...props }, ref) => {
	return (
		<div ref={ref} {...props}>
			<Text>{`${flag} ${label}`}</Text>
		</div>
	)
})
CountryItem.displayName = 'CountryItem'

export const AddressAutocomplete = <T extends AddressSchema = AddressSchema>({
	name = 'address' as Path<T>,
}: AddressAutocompleteProps<T>) => {
	const apiUtils = api.useUtils()
	const form = useFormContext<T>()
	const { control } = form
	const formValues = useWatch<T>({
		control,
	})
	const { addressVisibility } = formValues
	const previousAddressVisibility = usePrevious(addressVisibility)
	const getFieldName = (field: keyof AddressSchema['address'] | keyof AddressSchema) =>
		(field === 'addressVisibility' ? field : `${name}.${field}`) as Path<T>

	const [searchTerm, setSearchTerm] = useState<string>('')
	const [search] = useDebouncedValue(searchTerm, 200)
	const [googlePlaceId, setGooglePlaceId] = useState<string>('')
	const { t, i18n } = useTranslation(['gov-dist'])

	const disableFieldUntilCountry = !formValues.address?.countryId
	const visibilityIsFull = addressVisibility === AddressVisibility.FULL

	console.log('search term', { search, searchTerm })

	const countryTranslation = new Intl.DisplayNames(i18n.language, { type: 'region' })
	const { data: countryOptions } = api.fieldOpt.govDistsByCountryNoSub.useQuery(
		{ activeForOrgs: true },
		{
			refetchOnWindowFocus: false,
			select: (result) =>
				result
					.map(({ id, flag, cca2, govDist }) => ({
						flag,
						cca2,
						value: id,
						label: countryTranslation.of(cca2) ?? cca2,
						group: ['CA', 'US', 'MX'].includes(cca2) ? 'Popular' : 'All',
						govDist: govDist.map(({ id: govDistId, tsKey, tsNs, abbrev }) => ({
							label: t(tsKey, { ns: tsNs }),
							value: govDistId,
							abbrev,
						})),
					}))
					.toSorted((a) => (a.group === 'Popular' ? -1 : 1)),
		}
	)

	const govDistOptions = useMemo(() => {
		const selectedCountryId = formValues.address?.countryId
		if (typeof selectedCountryId !== 'string') {
			return []
		}
		const govDistItems =
			countryOptions?.find(({ value: countryId }) => countryId === selectedCountryId)?.govDist ?? []
		return govDistItems
	}, [countryOptions, formValues.address?.countryId])

	console.log({ countryOptions, govDistOptions })

	const setFormValue = useCallback(
		(fieldName: Path<T>, value: FieldPathValue<T, typeof fieldName>) => {
			form.setValue<Path<T>>(fieldName, value)
		},
		[form]
	)

	const { data: autoCompleteSearch } = api.geo.autocomplete.useQuery(
		{ search, fullAddress: visibilityIsFull },
		{
			enabled: search !== '',
			refetchOnWindowFocus: false,
		}
	)
	const { data: geoCodedAddress } = api.geo.geoByPlaceId.useQuery(googlePlaceId, {
		enabled: googlePlaceId !== '',
		refetchOnWindowFocus: false,
	})
	useEffect(() => {
		if (geoCodedAddress?.result) {
			const isFullAddress = addressVisibility === AddressVisibility.FULL
			const { result } = geoCodedAddress
			const country = countryOptions?.find(({ cca2 }) => cca2 === result.country)
			invariant(country)
			const govDist = country?.govDist.find(({ abbrev }) => abbrev === result.govDist)
			const formattedStreet1 =
				compact([result.streetNumber, result.streetName]).length === 2
					? compact([result.streetNumber, result.streetName]).join(' ')
					: undefined

			// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
			const valuesToSet = {
				...formValues.address,
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
			} as FieldPathValue<T, typeof name>
			setFormValue(name, valuesToSet)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [geoCodedAddress])

	const handleAutocompleteSelection = useCallback(
		(item: AutocompleteItem) => {
			if (!item.placeId) {
				return
			}
			setGooglePlaceId(item.placeId)
		},
		[setGooglePlaceId]
	)

	const getAndSetCoords = useCallback(
		async (hookForm: typeof form, visibilityVal: AddressVisibility | string | null) => {
			const newAddressVisibility = AddressVisibilitySchema.parse(visibilityVal)
			const currentFormValues = hookForm.getValues(name)
			if (!currentFormValues || !(currentFormValues instanceof Object)) {
				return
			}
			switch (newAddressVisibility) {
				case AddressVisibility.FULL: {
					const { street1, street2, city, postCode } = currentFormValues
					const searchTerms = compact([street1, street2, city, postCode]).join(', ')
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
					}

					break
				}
				case AddressVisibility.PARTIAL:
				case AddressVisibility.HIDDEN: {
					const { city, countryId: country, govDistId: govDist } = currentFormValues
					if (typeof city !== 'string') {
						break
					}
					const { results: cityResults } = await apiUtils.geo.cityCoords.fetch({
						city,
						country,
						govDist,
					})
					if (cityResults && !Array.isArray(cityResults)) {
						const { place_id } = cityResults
						setGooglePlaceId(place_id)
					}

					break
				}
			}
		},
		[apiUtils, name]
	)

	useEffect(() => {
		if (formValues.addressVisibility && formValues.addressVisibility !== previousAddressVisibility) {
			getAndSetCoords(form, formValues.addressVisibility)
		}
	}, [form, formValues.addressVisibility, getAndSetCoords, previousAddressVisibility])

	const Street1Input =
		addressVisibility === AddressVisibility.FULL ? (
			<Autocomplete
				itemComponent={AutoCompleteItem}
				data={autoCompleteSearch?.results ?? []}
				label='Address'
				withinPortal
				onItemSubmit={handleAutocompleteSelection}
				control={control}
				name={getFieldName('street1')}
				onChange={setSearchTerm}
				disabled={disableFieldUntilCountry}
				required
			/>
		) : (
			<TextInput
				label='Address'
				control={control}
				name={getFieldName('street1')}
				disabled={disableFieldUntilCountry}
			/>
		)

	const CityInput =
		addressVisibility === AddressVisibility.FULL ? (
			<TextInput
				label='City'
				required
				control={control}
				name={getFieldName('city')}
				disabled={disableFieldUntilCountry}
			/>
		) : (
			<Autocomplete
				itemComponent={AutoCompleteItem}
				data={autoCompleteSearch?.results ?? []}
				label='City'
				withinPortal
				onItemSubmit={handleAutocompleteSelection}
				control={control}
				name={getFieldName('city')}
				onChange={setSearchTerm}
				disabled={disableFieldUntilCountry}
				required
			/>
		)

	return (
		<Stack w='100%'>
			<Stack spacing={0}>
				<Select
					label='Country'
					data={countryOptions ?? []}
					itemComponent={CountryItem}
					required
					withinPortal
					searchable
					styles={{ dropdown: { width: 'fit-content !important' } }}
					control={control}
					name={getFieldName('countryId')}
				/>
				{Street1Input}
				<TextInput control={control} name={getFieldName('street2')} disabled={disableFieldUntilCountry} />
			</Stack>
			<Group noWrap>{CityInput}</Group>
			<Group noWrap>
				<Select
					label='State/Province'
					data={govDistOptions}
					required={Boolean(govDistOptions.length)}
					disabled={!govDistOptions.length}
					searchable
					withinPortal
					styles={{ dropdown: { width: 'fit-content !important' } }}
					control={control}
					name={getFieldName('govDistId')}
				/>
				<TextInput
					label='Postal code'
					required={visibilityIsFull}
					disabled={disableFieldUntilCountry}
					control={control}
					name={getFieldName('postCode')}
				/>
			</Group>
			<Stack spacing={0}>
				<Group noWrap>
					<TextInput
						required
						label='Latitude'
						control={control}
						name={getFieldName('latitude')}
						disabled={disableFieldUntilCountry}
					/>
					<TextInput
						required
						label='Longitude'
						control={control}
						name={getFieldName('longitude')}
						disabled={disableFieldUntilCountry}
					/>
				</Group>
			</Stack>
		</Stack>
	)
}

interface AddressSchema {
	address: {
		street1?: string | null
		street2?: string | null
		city?: string | null
		postCode?: string | null
		govDistId?: string
		countryId: string
		longitude?: number
		latitude?: number
		geoWKT?: string | null
	}
	addressVisibility: AddressVisibility
}

export interface AddressAutocompleteProps<T extends FieldValues> extends UseControllerProps<T> {}

interface AutocompleteItem {
	value: string
	name?: string
	subheading?: string
	placeId?: string
}
interface CountryItem {
	value: string
	label: string
	flag: string
}
