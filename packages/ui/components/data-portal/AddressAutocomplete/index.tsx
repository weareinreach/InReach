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

export const AddressAutocomplete = <T extends AddressSchema>({
	name = 'address' as Path<T>,
	addressVisibility,
}: AddressAutocompleteProps<T>) => {
	const apiUtils = api.useUtils()
	const form = useFormContext<T>()
	const { control } = form
	const previousAddressVisibility = usePrevious(addressVisibility)
	const getFieldName = (field: keyof AddressSchema['address'] | keyof AddressSchema) =>
		(field === 'addressVisibility' ? field : `${name}.${field}`) as Path<T> //
	const selectedCountryId = useWatch({ control, name: getFieldName('countryId') })

	const [searchTerm, setSearchTerm] = useState<string>('')
	const [search] = useDebouncedValue(searchTerm, 200)
	const [googlePlaceId, setGooglePlaceId] = useState<string>('')
	const { t, i18n } = useTranslation(['gov-dist'])

	const disableFieldUntilCountry = !selectedCountryId
	const visibilityIsFull = addressVisibility === AddressVisibility.FULL

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
		if (typeof selectedCountryId !== 'string') {
			return []
		}
		const govDistItems = countryOptions?.find(({ value }) => value === selectedCountryId)?.govDist ?? []
		return govDistItems
	}, [countryOptions, selectedCountryId])

	const setFormValue = useCallback(
		(fieldName: Path<T>, value: FieldPathValue<T, typeof fieldName>) => {
			form.setValue<Path<T>>(fieldName, value)
		},
		[form]
	)

	const selectedCountryCca2 = useMemo(() => {
		if (!selectedCountryId || !countryOptions) return undefined
		return countryOptions.find((c) => c.value === selectedCountryId)?.cca2
	}, [countryOptions, selectedCountryId])

	const { data: autoCompleteSearch } = api.geo.autocomplete.useQuery(
		{ search, fullAddress: true, locale: selectedCountryCca2 },
		{
			enabled: search !== '' && !!selectedCountryCca2,
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

			if (isFullAddress) {
				setFormValue(getFieldName('street1'), formattedStreet1 as FieldPathValue<T, Path<T>>)
				setFormValue(getFieldName('street2'), result.street2 as FieldPathValue<T, Path<T>>)
				setFormValue(getFieldName('postCode'), result.postCode as FieldPathValue<T, Path<T>>)
			} else {
				setFormValue(getFieldName('postCode'), null as FieldPathValue<T, Path<T>>)
			}

			setFormValue(getFieldName('city'), result.city as FieldPathValue<T, Path<T>>)
			if (country) setFormValue(getFieldName('countryId'), country.value as FieldPathValue<T, Path<T>>)
			if (govDist) setFormValue(getFieldName('govDistId'), govDist.value as FieldPathValue<T, Path<T>>)
			setFormValue(getFieldName('latitude'), result.geometry.location.lat as FieldPathValue<T, Path<T>>)
			setFormValue(getFieldName('longitude'), result.geometry.location.lng as FieldPathValue<T, Path<T>>)
			setFormValue(
				getFieldName('geoWKT'),
				createWktFromLatLng({
					latitude: result.geometry.location.lat,
					longitude: result.geometry.location.lng,
				}) as FieldPathValue<T, Path<T>>
			)
		}
	}, [
		geoCodedAddress,
		addressVisibility,
		countryOptions,
		setFormValue,
		getFieldName,
		i18n.language,
		t,
		govDistOptions,
	])

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
					if (!searchTerms) {
						break
					}
					const { results: autocompleteResults } = await apiUtils.geo.autocomplete.fetch({
						search: searchTerms, //
						fullAddress: true,
						locale: selectedCountryCca2,
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
		[apiUtils, name, selectedCountryCca2]
	)

	useEffect(() => {
		if (addressVisibility && addressVisibility !== previousAddressVisibility) {
			getAndSetCoords(form, addressVisibility)
		}
	}, [form, addressVisibility, getAndSetCoords, previousAddressVisibility])

	const Street1Input = (
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
	)

	const CityInput = (
		<TextInput
			label='City'
			required
			control={control}
			name={getFieldName('city')}
			disabled={disableFieldUntilCountry}
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

export interface AddressAutocompleteProps<T extends FieldValues> extends UseControllerProps<T> {
	addressVisibility?: AddressVisibility
}

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
