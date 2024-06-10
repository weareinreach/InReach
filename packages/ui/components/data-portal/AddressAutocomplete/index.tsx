import { createStyles, Group, Stack, Text } from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { useTranslation } from 'next-i18next'
import { forwardRef, useCallback, useEffect, useState } from 'react'
import {
	type FieldValues,
	type Path,
	type UseControllerProps,
	useFormContext,
	useWatch,
} from 'react-hook-form'
import { Autocomplete, Select, TextInput } from 'react-hook-form-mantine'
import reactStringReplace from 'react-string-replace'

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

export const AddressAutocomplete = <T extends AddressSchema>({ name }: AddressAutocompleteProps<T>) => {
	const form = useFormContext()
	const { control } = form
	const formValues = useWatch({
		control,
	})
	const [govDistOpts, setGovDistOpts] = useState<{ value: string; label: string }[]>([])
	const [countryOpts, setCountryOpts] = useState<CountryItem[]>([])
	const [searchTerm, setSearchTerm] = useState<string>('')
	const [search] = useDebouncedValue(searchTerm, 200)
	const [googlePlaceId, setGooglePlaceId] = useState<string>('')
	const { t, i18n } = useTranslation(['attribute', 'gov-dist'])
	const countryTranslation = new Intl.DisplayNames(i18n.language, { type: 'region' })
	const { data: govDistsByCountry } = api.fieldOpt.govDistsByCountryNoSub.useQuery(
		{ activeForOrgs: true },
		{
			refetchOnWindowFocus: false,
		}
	)
	const setFormValue = useCallback(
		(fieldName: Path<AddressSchema>, value: unknown) => {
			form.setValue<Path<AddressSchema>>(fieldName, value)
		},
		[form]
	)
	const getFieldName = (field: keyof AddressSchema['address']) => `${name}.${field}` as Path<T>

	useEffect(() => {
		if (govDistsByCountry && !countryOpts.length) {
			setCountryOpts(
				govDistsByCountry.map(({ id, flag, cca2 }) => ({
					flag,
					value: id,
					label: countryTranslation.of(cca2) ?? cca2,
				}))
			)
			if (!formValues.address?.countryId) {
				const countryId = govDistsByCountry.find(({ cca2 }) => cca2 === 'US')?.id

				if (typeof countryId === 'string') {
					setFormValue(name, { countryId })
				}
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [countryTranslation, govDistsByCountry, form])

	useEffect(() => {
		if (govDistsByCountry && formValues.address?.countryId) {
			const dists = govDistsByCountry.find(({ id }) => id === formValues.address?.countryId)?.govDist
			setGovDistOpts(
				dists?.map(({ id, tsKey, tsNs }) => ({ label: t(tsKey, { ns: tsNs }), value: id })) ?? []
			)
		}
	}, [formValues.address?.countryId, govDistsByCountry, t])

	const { data: autoCompleteSearch } = api.geo.autocomplete.useQuery(
		{ search, fullAddress: true },
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
			const { result } = geoCodedAddress
			const country = govDistsByCountry?.find(({ cca2 }) => cca2 === result.country)
			const govDist = country?.govDist.find(({ abbrev }) => abbrev === result.govDist)

			setFormValue(name, {
				street1: `${result.streetNumber} ${result.streetName}`,
				street2: result.street2,
				city: result.city,
				postCode: result.postCode,
				...(country ? { countryId: country.id } : {}),
				...(govDist ? { govDistId: govDist.id } : {}),
				latitude: result.geometry.location.lat,
				longitude: result.geometry.location.lng,
			})
		}
	}, [geoCodedAddress, govDistsByCountry, name, setFormValue])
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
		},
		[setSearchTerm]
	)

	return (
		<Stack w='100%'>
			<Stack spacing={0}>
				<Autocomplete
					itemComponent={AutoCompleteItem}
					data={autoCompleteSearch?.results ?? []}
					label='Address'
					withinPortal
					onItemSubmit={handleAutocompleteSelection}
					control={control}
					name={getFieldName('street1')}
					onChange={handleAutocompleteChange}
				/>
				<TextInput control={control} name={getFieldName('street2')} />
			</Stack>
			<Group noWrap>
				<TextInput label='City' required control={control} name={getFieldName('city')} />
				<Select
					label='State'
					data={govDistOpts}
					required={Boolean(govDistOpts.length)}
					disabled={!govDistOpts.length}
					searchable
					withinPortal
					styles={{ dropdown: { width: 'fit-content !important' } }}
					control={control}
					name={getFieldName('govDistId')}
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
					control={control}
					name={getFieldName('countryId')}
				/>
				<TextInput
					label='Postal code'
					required
					disabled={!formValues.address?.countryId}
					control={control}
					name={getFieldName('postCode')}
				/>
			</Group>
			<Stack spacing={0}>
				<Group noWrap>
					<TextInput label='Latitude' control={control} name={getFieldName('latitude')} />
					<TextInput label='Longitude' control={control} name={getFieldName('longitude')} />
				</Group>
			</Stack>
		</Stack>
	)
}

interface AddressSchema {
	address: {
		street1?: string
		street2?: string
		city?: string
		postCode?: string
		govDistId?: string
		countryId: string
		longitude?: number
		latitude?: number
	}
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
