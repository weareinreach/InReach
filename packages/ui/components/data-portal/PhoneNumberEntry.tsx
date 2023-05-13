import {
	createStyles,
	Group,
	rem,
	Select,
	type SelectProps,
	Text,
	TextInput,
	type TextInputProps,
} from '@mantine/core'
import { AsYouType, type CountryCode, isSupportedCountry } from 'libphonenumber-js'
import { type ComponentPropsWithoutRef, forwardRef, useEffect, useState } from 'react'
import PhoneInput, { type Props as PhoneInputProps } from 'react-phone-number-input/input'

import { type ApiOutput } from '@weareinreach/api'
import { trpc as api } from '~ui/lib/trpcClient'

type CountryList = ApiOutput['fieldOpt']['countries']
interface PhoneCountrySelectItem extends ComponentPropsWithoutRef<'div'>, PhoneCountryItem {}
interface PhoneCountryItem {
	label: string
	value: string
	data: Pick<CountryList[number], 'name' | 'cca2'>
}

const PhoneCountrySelectItem = forwardRef<HTMLDivElement, PhoneCountrySelectItem>(
	({ data, value, label, ...props }, ref) => {
		const { name } = data
		return (
			<Group ref={ref} {...props} w='100%'>
				<Text>{`${label} ${name}`}</Text>
			</Group>
		)
	}
)
PhoneCountrySelectItem.displayName = 'PhoneCountrySelectItem'

const isValidCountry = (country: string): country is CountryCode => isSupportedCountry(country)
const useCountrySelectStyles = createStyles((theme) => ({
	dropdown: {
		width: 'fit-content !important',
		left: 'unset !important',
		right: 0,
	},
	root: {
		width: rem(48),
	},
	input: {
		border: 'none',
		padding: 0,
		height: '2rem',
	},
	rightSection: {
		paddingRight: 0,
	},
}))
const usePhoneEntryStyles = createStyles((theme) => ({
	rightSection: {
		padding: `0 ${rem(4)}`,
		margin: `${rem(2)} 0`,
		borderLeft: `1px solid ${theme.other.colors.primary.lightGray}`,
	},
}))
export interface PhoneNumberEntryProps {
	countrySelectProps: Omit<SelectProps, 'data' | 'itemComponent' | 'classNames' | 'clearable'>
	phoneEntryProps: Omit<
		PhoneInputProps<Omit<TextInputProps, 'rightSection' | 'rightSectionWidth' | 'classNames'>>,
		'country' | 'defaultCountry' | 'itemComponent'
	> & {
		setError?: (err: string) => void
	}
}

export const PhoneNumberEntry = ({
	countrySelectProps,
	phoneEntryProps: allPhoneEntryProps,
}: PhoneNumberEntryProps) => {
	const [countryList, setCountryList] = useState<PhoneCountryItem[]>([])
	const [selectedCountry, setSelectedCountry] = useState<CountryCode | undefined>()
	const { classes: countrySelectClasses } = useCountrySelectStyles()
	const { classes: phoneEntryClasses } = usePhoneEntryStyles()

	const { setError: setPhoneError, ...phoneEntryProps } = allPhoneEntryProps

	const topCountries = ['US', 'CA', 'MX']

	api.fieldOpt.countries.useQuery(
		{ where: { activeForOrgs: true } },
		{
			onSuccess: (data) =>
				setCountryList(
					data
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
							} else return a.data.cca2.localeCompare(b.data.cca2)
						})
				),
		}
	)

	const phoneFormatter = new AsYouType(selectedCountry)
	useEffect(() => {
		const { data } = countryList.find(({ value }) => value === countrySelectProps.value) ?? {}
		if (data?.cca2 && isValidCountry(data.cca2)) setSelectedCountry(data.cca2)
		else if (data === undefined) setSelectedCountry(undefined)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [countrySelectProps.value])

	useEffect(() => {
		if (phoneEntryProps.value) {
			phoneFormatter.input(phoneEntryProps.value)
			const phoneCountry = phoneFormatter.getNumber()?.country
			if (phoneCountry && phoneCountry !== selectedCountry) {
				const countryId = countryList.find(({ data }) => data.cca2 === phoneCountry)?.value
				if (countryId && typeof countrySelectProps.onChange === 'function') {
					setSelectedCountry(phoneCountry)
					countrySelectProps.onChange(countryId)
				} else if (typeof setPhoneError === 'function') {
					setPhoneError(`Country not active: ${phoneCountry}`)
				}
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [phoneEntryProps.value])

	const countrySelection = (
		<Select
			data={countryList}
			itemComponent={PhoneCountrySelectItem}
			classNames={countrySelectClasses}
			clearable
			{...countrySelectProps}
		/>
	)

	return (
		<PhoneInput
			country={selectedCountry}
			defaultCountry='US'
			inputComponent={TextInput}
			rightSection={countrySelection}
			rightSectionWidth={56}
			classNames={phoneEntryClasses}
			{...phoneEntryProps}
		/>
	)
}
