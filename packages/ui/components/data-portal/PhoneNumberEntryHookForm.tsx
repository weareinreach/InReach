import { DevTool } from '@hookform/devtools'
import { ErrorMessage } from '@hookform/error-message'
import { createStyles, Group, rem, Text, TextInput, type TextInputProps } from '@mantine/core'
import { AsYouType } from 'libphonenumber-js'
import { type ComponentPropsWithoutRef, forwardRef, useEffect, useMemo } from 'react'
import { type FieldValues, type Path, useFormContext, useFormState } from 'react-hook-form'
import {
	Select,
	type SelectProps,
	// TextInput,
	// type TextInputProps,
} from 'react-hook-form-mantine'
import PhoneInput, {
	// parsePhoneNumber,
	type Props as PhoneInputProps,
} from 'react-phone-number-input/react-hook-form-input'

import { type ApiOutput } from '@weareinreach/api'
import { isCountryCode } from '~ui/hooks/usePhoneNumber'
import { trpc as api } from '~ui/lib/trpcClient'

const DEFAULT_COUNTRY = 'US'

const PhoneCountrySelectItem = forwardRef<HTMLDivElement, PhoneCountrySelectItem>(
	({ data, value, label, ...props }, ref) => {
		const { name } = data
		return (
			<Group ref={ref} {...props} w='100%' noWrap>
				<Text>{label}</Text>
				<Text>{name}</Text>
				{/* <Text>{`${label} ${name}`}</Text> */}
			</Group>
		)
	}
)
PhoneCountrySelectItem.displayName = 'PhoneCountrySelectItem'

const useCountrySelectStyles = createStyles((theme) => ({
	dropdown: {
		width: 'max-content !important',
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
	const phoneNumber = form.watch(allPhoneEntryProps.name)
	// const [selectedCountry, setSelectedCountry] = useState<CountryCode | undefined>()
	const { classes: countrySelectClasses } = useCountrySelectStyles()
	const { classes: phoneEntryClasses } = usePhoneEntryStyles()
	const {
		setError: setPhoneError,
		// value: phoneValue,
		// onChange: onPhoneChange,
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
	const activeCountry = useMemo(() => {
		const result = countryList?.find(({ value }) => value === selectedCountry)?.data.cca2
		if (result && isCountryCode(result)) return result
		return undefined
	}, [selectedCountry, countryList])

	const phoneFormatter = new AsYouType(activeCountry)
	// useEffect(() => {
	// 	const { data } = countryList.find(({ value }) => value === countrySelectProps.value) ?? {}
	// 	if (data?.cca2 && isCountryCode(data.cca2)) setSelectedCountry(data.cca2)
	// 	else if (data === undefined) setSelectedCountry(undefined)
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [countrySelectProps.value])

	useEffect(() => {
		if (phoneNumber) {
			phoneFormatter.input(phoneNumber)
			const phoneCountry = phoneFormatter.getNumber()?.country

			console.log(
				`🚀 ~ file: PhoneNumberEntryHookForm.tsx:124 ~ useEffect ~ phoneCountry/selectedCountry:`,
				phoneCountry,
				selectedCountry
			)
			const formError = form.formState.errors
			console.log(formError)
			if ((!phoneCountry && !selectedCountry) || phoneCountry !== selectedCountry) {
				const countryId = countryList.find(({ data }) => data.cca2 === phoneCountry)?.value

				if (countryId) {
					console.log('setting countryId')
					// @ts-expect-error -> string is okay.
					form.setValue(countrySelectProps.name, countryId)
					if (countrySelectProps.onChange && typeof countrySelectProps.onChange === 'function') {
						countrySelectProps.onChange(countryId)
					}
				} else if (!phoneCountry && formError[phoneEntryProps.name]) {
					console.log('clearing error')
					form.resetField(countrySelectProps.name)
					form.clearErrors(phoneEntryProps.name)
					// // @ts-expect-error -> null is okay.
					// form.setValue(countrySelectProps.name, null)
				} else if (phoneCountry && !countryId) {
					console.log('setting error')
					form.setError(
						phoneEntryProps.name,
						{ message: `Country not active: ${phoneCountry}` },
						{ shouldFocus: true }
					)
				}
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [phoneNumber])

	const countrySelection = (
		<Select
			data={countryList}
			itemComponent={PhoneCountrySelectItem}
			classNames={countrySelectClasses}
			clearable
			control={form.control}
			{...countrySelectProps}
		/>
	)

	return (
		<>
			<PhoneInput
				country={activeCountry}
				defaultCountry={DEFAULT_COUNTRY}
				inputComponent={TextInput}
				rightSection={countrySelection}
				rightSectionWidth={56}
				classNames={phoneEntryClasses}
				// value={parsePhoneNumber(String(phoneValue), DEFAULT_COUNTRY)?.number}
				// onChange={(e) =>
				// 	onPhoneChange && typeof onPhoneChange === 'function' ? onPhoneChange(e) : undefined
				// }
				control={form.control}
				// error={form.getFieldState(phoneEntryProps.name).error?.message}
				// rules={{
				// 	validate: (val) => {
				// 		if (val) {
				// 			const formatter = phoneFormatter.input(val)
				// 			console.log('formatter', formatter)
				// 		}
				// 		const derivedCountry = phoneFormatter.getNumber()?.country
				// 		console.log('val', val)
				// 		console.log('derivedCountry', derivedCountry)
				// 		const result = !!countryList.find(({ data }) => data.cca2 === phoneFormatter.getNumber()?.country)
				// 		console.log('validator result', result)
				// 		return result
				// 	},
				// }}
				// @ts-expect-error -> name prop is okay.
				error={<ErrorMessage errors={form.formState.errors} name={phoneEntryProps.name} as='span' />}
				{...phoneEntryProps}
			/>
			<DevTool control={form.control} />
		</>
	)
}

export interface PhoneNumberEntryProps<T extends FieldValues> {
	countrySelectProps: Omit<SelectProps<T>, 'data' | 'itemComponent' | 'classNames' | 'clearable'>
	phoneEntryProps: Omit<
		PhoneInputProps<TextInputProps, T>,
		'country' | 'defaultCountry' | 'itemComponent'
	> & {
		setError?: (err: string) => void
		'data-autofocus'?: boolean
		name: Path<T>
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
