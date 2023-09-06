import { createStyles, Group, rem, Text } from '@mantine/core'
import { AsYouType, type CountryCode } from 'libphonenumber-js'
import { type ComponentPropsWithoutRef, forwardRef, useEffect, useState } from 'react'
import { type FieldValues, useFormContext, useWatch } from 'react-hook-form'
import { Select, type SelectProps, TextInput, type TextInputProps } from 'react-hook-form-mantine'
import PhoneInput, { parsePhoneNumber, type Props as PhoneInputProps } from 'react-phone-number-input/input'
import { type SetOptional } from 'type-fest'

import { type ApiOutput } from '@weareinreach/api'
import { isCountryCode } from '~ui/hooks/usePhoneNumber'
import { trpc as api } from '~ui/lib/trpcClient'

const DEFAULT_COUNTRY = 'US'

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

const useCountrySelectStyles = createStyles((theme) => ({
	dropdown: {
		width: 'fit-content !important',
		left: 'unset !important',
		// right: 0,
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

export const PhoneNumberEntry = <T extends FieldValues>({
	countrySelectProps,
	phoneEntryProps: allPhoneEntryProps,
}: PhoneNumberEntryProps<T>) => {
	const form = useFormContext<T>()
	// const selectedCountry = useWatch<T>({control: countrySelectProps.control, name: countrySelectProps.name})
	const selectedCountry = form.watch(countrySelectProps.name)
	// const [selectedCountry, setSelectedCountry] = useState<CountryCode | undefined>()
	const { classes: countrySelectClasses } = useCountrySelectStyles()
	const { classes: phoneEntryClasses } = usePhoneEntryStyles()
	const {
		setError: setPhoneError,
		value: phoneValue,
		onChange: onPhoneChange,
		...phoneEntryProps
	} = allPhoneEntryProps

	const topCountries = ['US', 'CA', 'MX']

	const { data: countryList } = api.fieldOpt.countries.useQuery(
		{ where: { activeForOrgs: true } },
		{
			initialData: [],
			select: (data) =>
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
					}),
		}
	)
	const phoneFormatter = new AsYouType(selectedCountry)
	// useEffect(() => {
	// 	const { data } = countryList.find(({ value }) => value === countrySelectProps.value) ?? {}
	// 	if (data?.cca2 && isCountryCode(data.cca2)) setSelectedCountry(data.cca2)
	// 	else if (data === undefined) setSelectedCountry(undefined)
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [countrySelectProps.value])

	useEffect(() => {
		if (phoneValue) {
			phoneFormatter.input(phoneValue)
			const phoneCountry = phoneFormatter.getNumber()?.country
			if (phoneCountry && phoneCountry !== selectedCountry) {
				const countryId = countryList.find(({ data }) => data.cca2 === phoneCountry)?.value
				if (countryId) {
					form.setValue(countrySelectProps.name, countryId)
					if (countrySelectProps.onChange && typeof countrySelectProps.onChange === 'function') {
						countrySelectProps.onChange(countryId)
					}
				} else if (typeof setPhoneError === 'function') {
					setPhoneError(`Country not active: ${phoneCountry}`)
				}
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [phoneValue])

	const countrySelection = (
		<Select
			data={countryList}
			itemComponent={PhoneCountrySelectItem}
			classNames={countrySelectClasses}
			clearable
			{...form.register(countrySelectProps.name)}
			{...countrySelectProps}
		/>
	)

	return (
		<PhoneInput
			country={selectedCountry}
			defaultCountry={DEFAULT_COUNTRY}
			inputComponent={TextInput}
			rightSection={countrySelection}
			rightSectionWidth={56}
			classNames={phoneEntryClasses}
			value={parsePhoneNumber(String(phoneValue), DEFAULT_COUNTRY)?.number}
			onChange={(e) => (onPhoneChange && typeof onPhoneChange === 'function' ? onPhoneChange(e) : undefined)}
			{...form.register(phoneEntryProps.name)}
			{...phoneEntryProps}
		/>
	)
}

export interface PhoneNumberEntryProps<T extends FieldValues> {
	countrySelectProps: Omit<SelectProps<T>, 'data' | 'itemComponent' | 'classNames' | 'clearable'>
	phoneEntryProps: Omit<
		SetOptional<
			PhoneInputProps<Omit<TextInputProps<T>, 'rightSection' | 'rightSectionWidth' | 'classNames'>>,
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
interface PhoneCountrySelectItem extends ComponentPropsWithoutRef<'div'>, PhoneCountryItem {}
interface PhoneCountryItem {
	label: string
	value: string
	data: Pick<CountryList[number], 'name' | 'cca2'>
}
