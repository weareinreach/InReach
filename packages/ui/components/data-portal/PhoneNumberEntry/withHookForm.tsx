import { ErrorMessage } from '@hookform/error-message'
import { Text, TextInput, type TextInputProps } from '@mantine/core'
import { AsYouType } from 'libphonenumber-js'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
	type Control,
	type FieldValues,
	useController,
	type UseControllerProps,
	useWatch,
} from 'react-hook-form'
import { TextInput as FormTextInput, Select, type SelectProps } from 'react-hook-form-mantine'
import { isValidPhoneNumber, parsePhoneNumber } from 'react-phone-number-input'
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

	// The masked phone input below can only display values it can actually parse. Some existing
	// records (bad legacy data, or a malformed number that was saved before validation caught it)
	// don't parse at all, which made the field render blank with no indication anything was even
	// saved. This checks the value once, the first time it loads in (not on every keystroke, so
	// correcting it doesn't cause the input to flicker/swap mid-edit), and falls back to a plain
	// text field showing the raw value if the masked input can't represent it.
	const [showRawFallback, setShowRawFallback] = useState(false)
	const hasCheckedInitialValue = useRef(false)
	useEffect(() => {
		if (hasCheckedInitialValue.current || !phoneNumber) {
			return
		}
		hasCheckedInitialValue.current = true
		if (!parsePhoneNumber(phoneNumber, activeCountry)) {
			setShowRawFallback(true)
		}
	}, [phoneNumber, activeCountry])

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
			// Catches anything that isn't a real, deliverable number for the selected country
			// (wrong length, bad area code, etc.) - without this, a malformed number silently
			// saved as-is, since neither this form nor the API rejected it.
			validPhoneNumber: (number?: string) => {
				if (!number || !activeCountry) {
					return true
				}
				return isValidPhoneNumber(number, activeCountry) || `Not a valid phone number for ${activeCountry}`
			},
			invalidCountry: (number?: string) => {
				if (number) {
					const parsed = parsePhoneNumber(number)
					if (parsed?.country) {
						return validCountries.includes(parsed.country) || `Country not enabled: ${parsed.country}`
					}
				}
				return true
			},
		},
	}

	if (showRawFallback) {
		return (
			<>
				<FormTextInput
					name={peName}
					control={control}
					label={label}
					required={required}
					rules={phoneValidationRules}
					rightSection={countrySelection}
					rightSectionWidth={56}
				/>
				<Text size='xs' color='dimmed'>
					This number couldn&apos;t be displayed in the normal format - showing the raw saved value. Re-enter
					it to fix.
				</Text>
			</>
		)
	}

	return (
		<PhoneInput<TextInputProps, T>
			// `defaultCountry` only has an effect when `country` is unset - passing both
			// unconditionally trips this library's own console.error on every render once a
			// country is selected, since it treats that as a mistake rather than a fallback.
			{...(activeCountry ? { country: activeCountry } : { defaultCountry: DEFAULT_COUNTRY })}
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
