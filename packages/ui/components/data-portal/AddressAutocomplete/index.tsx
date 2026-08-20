import {
	Combobox,
	type ComboboxItemGroup,
	Group,
	TextInput as MantineTextInput,
	Stack,
	Text,
	useCombobox,
} from '@mantine/core'
import { useDebouncedValue, usePrevious } from '@mantine/hooks'
import compact from 'just-compact'
import { useTranslation } from 'next-i18next/pages'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
	type FieldPathValue,
	type FieldValues,
	type Path,
	useController,
	type UseControllerProps,
	useFormContext,
	useWatch,
} from 'react-hook-form'
import { Select, TextInput } from 'react-hook-form-mantine'
import reactStringReplace from 'react-string-replace'
import invariant from 'tiny-invariant'

import { type ApiOutput } from '@weareinreach/api'
import { AddressVisibility } from '@weareinreach/db/enums'
import { AddressVisibilitySchema } from '~ui/components/data-portal/AddressDrawer/schema'
import { cx } from '~ui/lib/cx'
import { createWktFromLatLng } from '~ui/lib/geotools'
import { trpc as api } from '~ui/lib/trpcClient'

import classes from './index.module.css'

const matchText = (result: string, textToMatch: string | undefined | null) => {
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

export const AddressAutocomplete = <T extends AddressSchema>({
	name = 'address' as Path<T>,
	addressVisibility,
}: AddressAutocompleteProps<T>) => {
	const apiUtils = api.useUtils()
	const form = useFormContext<T>()
	const { control } = form
	const previousAddressVisibility = usePrevious(addressVisibility)
	const getFieldName = useCallback(
		(field: keyof AddressSchema['address'] | keyof AddressSchema) =>
			(field === 'addressVisibility' ? field : `${name}.${field}`) as Path<T>, //
		[name]
	)
	const selectedCountryId = useWatch({ control, name: getFieldName('countryId') })

	const [searchTerm, setSearchTerm] = useState<string>('')
	const [search] = useDebouncedValue(searchTerm, 200)
	const [googlePlaceId, setGooglePlaceId] = useState<string>('')
	// The street text of whatever suggestion the user actually picked, kept alongside the placeId
	// it came from. Google's geocode lookup for a placeId sometimes has no confirmed street number
	// (common for routes/interpolated ranges) even though the suggestion the user selected showed
	// one - in that case we fall back to what they selected rather than silently dropping it.
	// Tying it to the placeId (not just setting/clearing it) means a later, unrelated geocode
	// lookup (e.g. from `getAndSetCoords` below) can never accidentally reuse a stale value.
	const [selectedPrediction, setSelectedPrediction] = useState<{ placeId: string; label: string } | null>(
		null
	)
	const { t, i18n } = useTranslation(['gov-dist'])

	const disableFieldUntilCountry = !selectedCountryId
	const visibilityIsFull = addressVisibility === AddressVisibility.FULL

	// Both `countryTranslation` and `selectCountryOptions` must stay referentially stable across
	// renders - react-query does NOT memoize a query's `select` output on its own, so an inline
	// selector recomputes (returning a brand-new array/object every time) on every render, not just
	// when the underlying data changes. `countryOptions` feeds both `govDistOptions` and the
	// geocode-result effect below as dependencies, so an unstable reference here previously caused
	// that effect to re-run on every render once a place was selected - a tight render loop.
	const countryTranslation = useMemo(
		() => new Intl.DisplayNames(i18n.language, { type: 'region' }),
		[i18n.language]
	)
	const selectCountryOptions = useCallback(
		(result: ApiOutput['fieldOpt']['govDistsByCountryNoSub']) =>
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
		[countryTranslation, t]
	)
	const { data: countryOptions } = api.fieldOpt.govDistsByCountryNoSub.useQuery(
		{ activeForOrgs: true },
		{
			refetchOnWindowFocus: false,
			select: selectCountryOptions,
		}
	)

	// `Select`'s `data` items in v7 can only be `{value, label}` - the flat `countryOptions` above
	// (kept for its `flag`/`cca2`/`govDist` lookups) is regrouped into real `ComboboxItemGroup`s here
	// instead of the old flat per-item `group` field, which v7 no longer renders as a group header.
	const groupedCountryOptions = useMemo<ComboboxItemGroup[]>(() => {
		if (!countryOptions) return []
		const groups = new Map<string, typeof countryOptions>()
		for (const item of countryOptions) {
			const list = groups.get(item.group) ?? []
			list.push(item)
			groups.set(item.group, list)
		}
		return [...groups.entries()].map(([group, items]) => ({
			group,
			items: items.map(({ value, label }) => ({ value, label })),
		}))
	}, [countryOptions])

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
			const streetParts = compact([result.streetNumber, result.streetName])
			const geocodedStreet1 = streetParts.length ? streetParts.join(' ') : undefined
			const predictedFallback =
				!result.streetNumber && selectedPrediction?.placeId === googlePlaceId
					? selectedPrediction.label
					: undefined
			const formattedStreet1 = predictedFallback ?? geocodedStreet1

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
		googlePlaceId,
		selectedPrediction,
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
			setSelectedPrediction({ placeId: item.placeId, label: item.label ?? item.value })
			setGooglePlaceId(item.placeId)
		},
		[setGooglePlaceId]
	)

	const street1Controller = useController<T>({ control, name: getFieldName('street1') })
	const street1Combobox = useCombobox({
		onDropdownClose: () => street1Combobox.resetSelectedOption(),
	})

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
					if (!city) {
						break
					}
					const { results: cityResults } = await apiUtils.geo.cityCoords.fetch({
						city,
						country,
						govDist: govDist || undefined,
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

	const street1Value = (street1Controller.field.value ?? '') as string

	const Street1Input = (
		<Combobox
			store={street1Combobox}
			onOptionSubmit={(value) => {
				const item = autoCompleteSearch?.results.find((result) => result.value === value)
				if (item) {
					handleAutocompleteSelection(item)
					street1Controller.field.onChange(item.value)
				}
				street1Combobox.closeDropdown()
			}}
		>
			<Combobox.Target>
				<MantineTextInput
					label='Address'
					required
					disabled={disableFieldUntilCountry}
					error={street1Controller.fieldState.error?.message}
					value={street1Value}
					onChange={(event) => {
						const value = event.currentTarget.value
						street1Controller.field.onChange(value)
						setSearchTerm(value)
						street1Combobox.openDropdown()
					}}
					onFocus={() => street1Combobox.openDropdown()}
					onBlur={() => {
						street1Controller.field.onBlur()
						street1Combobox.closeDropdown()
					}}
				/>
			</Combobox.Target>
			<Combobox.Dropdown>
				<Combobox.Options>
					{(autoCompleteSearch?.results ?? []).map((item) => (
						<Combobox.Option value={item.value} key={item.value}>
							<Text className={classes.unmatchedText} truncate>
								{matchText(item.value, street1Value)}
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
			<Stack gap={0}>
				<Select
					label='Country'
					data={groupedCountryOptions}
					renderOption={({ option }) => {
						const country = countryOptions?.find(({ value }) => value === option.value)
						return <Text>{`${country?.flag ?? ''} ${option.label}`}</Text>
					}}
					required
					searchable
					styles={{ dropdown: { width: 'fit-content !important' } }}
					control={control}
					name={getFieldName('countryId')}
				/>
				{Street1Input}
				<TextInput control={control} name={getFieldName('street2')} disabled={disableFieldUntilCountry} />
			</Stack>
			<Group wrap='nowrap'>{CityInput}</Group>
			<Group wrap='nowrap'>
				<Select
					label='State/Province'
					data={govDistOptions}
					required={Boolean(govDistOptions.length)}
					disabled={!govDistOptions.length}
					searchable
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
			<Stack gap={0}>
				<Group wrap='nowrap'>
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
	/** The street-only portion of the suggestion (Google's `structured_formatting.main_text`). */
	label?: string
	subheading?: string
	placeId?: string
}
interface CountryItem {
	value: string
	label: string
	flag: string
}
