import { ErrorMessage } from '@hookform/error-message'
import { TextInput, type TextInputProps } from '@mantine/core'
import { AsYouType } from 'libphonenumber-js'
import { useEffect, useMemo } from 'react'
import {
	type Control,
	type FieldValues,
	useController,
	type UseControllerProps,
	useWatch,
} from 'react-hook-form'
import { Select, type SelectProps } from 'react-hook-form-mantine'
import { parsePhoneNumber } from 'react-phone-number-input'
import PhoneInput, { type Props as PhoneInputProps } from 'react-phone-number-input/react-hook-form-input'

import { isCountryCode } from '~ui/hooks/usePhoneNumber'
import { trpc as api } from '~ui/lib/trpcClient'

import { CountrySelectItem } from './CountrySelectItem'
import { transformCountryList } from './lib'
import { useCountrySelectStyles, usePhoneEntryStyles } from './styles'

const DEFAULT_COUNTRY = 'US'

export const PhoneNumberEntry = <T extends FieldValues>({
	countrySelect,
	phoneInput,
	control,
	label = 'Phone Number',
	required,
}: PhoneNumberEntryProps<T>) => {
	const { data: countryData } = api.fieldOpt.countries.useQuery(
		{ activeForOrgs: true },
		{
			select: transformCountryList,
		}
	)
	const countryList = useMemo(() => {
		if (!countryData) {
			return []
		}
		return countryData
	}, [countryData])
	const validCountries = countryList.map(({ data }) => data.cca2)

	const {
		name: peName,
		defaultValue: peDefaultValue,
		rules: peRules,
		shouldUnregister: peShouldUnregister,
		...propsPhoneInput
	} = phoneInput
	const {
		name: csName,
		defaultValue: csDefaultValue,
		rules: csRules,
		shouldUnregister: csShouldUnregister,
		...propsCountrySelect
	} = countrySelect
	const phoneNumbControl = useController<T>({
		control,
		name: peName,
		defaultValue: peDefaultValue,
		rules: peRules,
		shouldUnregister: peShouldUnregister,
	})

	const countryControl = useController<T>({
		control,
		name: csName,
		defaultValue: csDefaultValue,
		rules: csRules,
		shouldUnregister: csShouldUnregister,
	})

	const [phoneNumber, selectedCountry] = useWatch({ name: [peName, csName], control })

	const { classes: countrySelectClasses } = useCountrySelectStyles()
	const { classes: phoneEntryClasses } = usePhoneEntryStyles()

	const activeCountry = useMemo(() => {
		const result = countryList?.find(({ value }) => value === selectedCountry)?.data.cca2
		if (result && isCountryCode(result)) {
			return result
		}
		return undefined
	}, [selectedCountry, countryList])

	const phoneFormatter = new AsYouType(activeCountry)

	useEffect(() => {
		if (phoneNumber) {
			phoneFormatter.input(phoneNumber)
			const phoneCountry = phoneFormatter.getNumber()?.country
			if ((!phoneCountry && !selectedCountry) || phoneCountry !== selectedCountry) {
				const countryId = countryList.find(({ data }) => data.cca2 === phoneCountry)?.value

				if (countryId) {
					countryControl.field.onChange(countryId)
					if (countrySelect.onChange && typeof countrySelect.onChange === 'function') {
						countrySelect.onChange(countryId)
					}
				}
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [phoneNumber])

	const countrySelection = (
		<Select
			data={countryList}
			itemComponent={CountrySelectItem}
			classNames={countrySelectClasses}
			clearable
			control={control}
			name={csName}
			// rules={{
			// 	deps: ['countryId'],
			// 	validate: {
			// 		validCountry: (country) => validCountries.includes(country) || 'Invalid country',
			// 	},
			// }}
			{...propsCountrySelect}
		/>
	)

	const fieldHasError = phoneNumbControl.fieldState.error !== undefined

	const errors = fieldHasError ? (
		<ErrorMessage
			errors={phoneNumbControl.formState.errors}
			// @ts-expect-error -> 'name' is FINE.
			name={peName}
			as='span'
		/>
	) : undefined
	const phoneValidationRules = {
		validate: {
			invalidCountry: (number?: string) => {
				if (number) {
					const parsed = parsePhoneNumber(number)
					if (parsed?.country) {
						return validCountries.includes(parsed.country) ?? `Country not enabled: ${parsed.country}`
					}
				}
				return true
			},
		},
	}

	return (
		<PhoneInput<TextInputProps, T>
			defaultCountry={DEFAULT_COUNTRY}
			inputComponent={TextInput}
			rightSection={countrySelection}
			rightSectionWidth={56}
			classNames={phoneEntryClasses}
			name={peName}
			control={control}
			label={label}
			required={required}
			error={errors}
			rules={phoneValidationRules}
			{...propsPhoneInput}
		/>
	)
}

export interface PhoneNumberEntryProps<T extends FieldValues> {
	countrySelect: UseControllerProps<T> &
		Omit<SelectProps<T>, 'data' | 'itemComponent' | 'classNames' | 'clearable'>
	phoneInput: UseControllerProps<T> &
		Omit<PhoneInputProps<TextInputProps, T>, 'country' | 'defaultCountry' | 'itemComponent'>
	control: Control<T>
	label?: string
	required?: boolean
}
