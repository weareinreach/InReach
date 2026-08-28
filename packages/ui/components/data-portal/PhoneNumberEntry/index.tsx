import {
	type ComboboxItem,
	type ComboboxItemGroup,
	type ComboboxLikeRenderOptionInput,
	Group,
	Select,
	type SelectProps,
	Text,
	TextInput,
	type TextInputProps,
} from '@mantine/core'
import { AsYouType, type CountryCode } from 'libphonenumber-js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import PhoneInput, { parsePhoneNumber, type Props as PhoneInputProps } from 'react-phone-number-input/input'
import { type SetOptional } from 'type-fest'

import { type ApiOutput } from '@weareinreach/api'
import { isCountryCode } from '~ui/hooks/usePhoneNumber'
import { trpc as api } from '~ui/lib/trpcClient'

import classes from './index.module.css'

const DEFAULT_COUNTRY = 'US'

const countrySelectClasses = {
	dropdown: classes.countrySelectDropdown,
	root: classes.countrySelectRoot,
	input: classes.countrySelectInput,
	section: classes.countrySelectSection,
}
const phoneEntryClasses = { section: classes.phoneEntrySection }

export const PhoneNumberEntry = ({
	countrySelectProps,
	phoneEntryProps: allPhoneEntryProps,
}: PhoneNumberEntryProps) => {
	const [countryList, setCountryList] = useState<PhoneCountryItem[]>([])
	const [selectedCountry, setSelectedCountry] = useState<CountryCode | undefined>()

	const {
		setError: setPhoneError,
		value: phoneValue,
		onChange: onPhoneChange,
		...phoneEntryProps
	} = allPhoneEntryProps

	const topCountries = ['US', 'CA', 'MX']

	const { data: countriesData } = api.fieldOpt.countries.useQuery({ activeForOrgs: true })

	useEffect(() => {
		if (!countriesData) {
			return
		}
		setCountryList(
			countriesData
				.map(({ id, flag, name, cca2 }) => ({
					value: id,
					label: `${flag}`,
					data: { name, cca2 },
					group: topCountries.includes(cca2) ? 'Common' : 'Others',
				}))
				.sort((a, b) => {
					if (topCountries.includes(a.data.cca2) && !topCountries.includes(b.data.cca2)) {
						return -1
					} else if (topCountries.includes(b.data.cca2) && !topCountries.includes(a.data.cca2)) {
						return 1
					} else {
						return a.data.cca2.localeCompare(b.data.cca2)
					}
				})
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [countriesData])

	const phoneFormatter = new AsYouType(selectedCountry)
	useEffect(() => {
		const { data } = countryList.find(({ value }) => value === countrySelectProps.value) ?? {}
		if (data?.cca2 && isCountryCode(data.cca2)) {
			setSelectedCountry(data.cca2)
		} else if (data === undefined) {
			setSelectedCountry(undefined)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [countrySelectProps.value])

	useEffect(() => {
		if (phoneValue) {
			phoneFormatter.input(phoneValue)
			const phoneCountry = phoneFormatter.getNumber()?.country
			if (phoneCountry && phoneCountry !== selectedCountry) {
				const foundCountry = countryList.find(({ data }) => data.cca2 === phoneCountry)
				if (foundCountry) {
					setSelectedCountry(phoneCountry)
					if (countrySelectProps.onChange && typeof countrySelectProps.onChange === 'function') {
						countrySelectProps.onChange(foundCountry.value, {
							value: foundCountry.value,
							label: foundCountry.label,
						})
					}
				} else if (typeof setPhoneError === 'function') {
					setPhoneError(`Country not active: ${phoneCountry}`)
				}
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [phoneValue])

	// `Select`'s `data` items in v7 can only be `{value, label}` - the flat `countryList` above (kept
	// for its `data`/`group` lookups) is regrouped into real `ComboboxItemGroup`s here instead of the
	// old flat per-item `group` field, which v7 no longer renders as a group header.
	const groupedCountryData = useMemo<ComboboxItemGroup<ComboboxItem>[]>(() => {
		const groups = new Map<string, PhoneCountryItem[]>()
		for (const item of countryList) {
			const group = groups.get(item.group) ?? []
			group.push(item)
			groups.set(item.group, group)
		}
		return [...groups.entries()].map(([group, items]) => ({
			group,
			items: items.map(({ value, label }) => ({ value, label })),
		}))
	}, [countryList])

	const renderCountryOption = useCallback(
		({ option }: ComboboxLikeRenderOptionInput<ComboboxItem>) => {
			const country = countryList.find(({ value }) => value === option.value)
			return (
				<Group w='100%'>
					<Text>{`${option.label} ${country?.data.name ?? ''}`}</Text>
				</Group>
			)
		},
		[countryList]
	)

	const countrySelection = (
		<Select
			data={groupedCountryData}
			renderOption={renderCountryOption}
			classNames={countrySelectClasses}
			clearable
			// Mantine 9's default `Select` renders the clear button *and* the dropdown chevron
			// side-by-side once a value is set - `'clear'` restores the old one-icon-at-a-time
			// behavior (clear button when a value is set, chevron otherwise). Same fix as
			// withHookForm.tsx's copy of this Select.
			clearSectionMode='clear'
			{...countrySelectProps}
		/>
	)

	return (
		<PhoneInput
			country={selectedCountry}
			defaultCountry={DEFAULT_COUNTRY}
			inputComponent={TextInput}
			rightSection={countrySelection}
			// Matches `.countrySelectRoot`'s own width (64px, `index.module.css`) plus a little
			// breathing room, so this country-select widget doesn't itself overlap the phone
			// number's own typed text. Same fix as withHookForm.tsx's copy of this field.
			rightSectionWidth={72}
			classNames={phoneEntryClasses}
			value={parsePhoneNumber(String(phoneValue), DEFAULT_COUNTRY)?.number}
			onChange={(e) => (onPhoneChange && typeof onPhoneChange === 'function' ? onPhoneChange(e) : undefined)}
			{...phoneEntryProps}
		/>
	)
}

export interface PhoneNumberEntryProps {
	countrySelectProps: Omit<SelectProps, 'data' | 'itemComponent' | 'classNames' | 'clearable'>
	phoneEntryProps: Omit<
		SetOptional<
			PhoneInputProps<Omit<TextInputProps, 'rightSection' | 'rightSectionWidth' | 'classNames'>>,
			'onChange'
		>,
		'country' | 'defaultCountry' | 'itemComponent'
	> & {
		setError?: (err: string) => void
		'data-autofocus'?: boolean
	}
	hookForm?: boolean
}

type CountryList = ApiOutput['fieldOpt']['countries']
interface PhoneCountryItem {
	label: string
	value: string
	data: Pick<CountryList[number], 'name' | 'cca2'>
	group: string
}
