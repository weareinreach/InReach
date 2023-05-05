import { createStyles, Group, rem, Select, Text, TextInput } from '@mantine/core'
import { AsYouType, type CountryCode, isSupportedCountry } from 'libphonenumber-js'
import { type ComponentPropsWithoutRef, forwardRef, useEffect, useState } from 'react'
import PhoneInput from 'react-phone-number-input/input'

import { type ApiOutput } from '@weareinreach/api'
import { trpc as api } from '~ui/lib/trpcClient'

import { useFormContext } from './context'

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
const usePhoneNumberEntryStyles = createStyles((theme) => ({
	dropdown: {
		width: 'fit-content !important',
		left: 'unset !important',
	},
	root: {
		width: rem(96),
	},
}))
export const PhoneNumberEntry = () => {
	const [countryList, setCountryList] = useState<PhoneCountryItem[]>([])
	const [selectedCountry, setSelectedCountry] = useState<CountryCode | undefined>()
	const { classes } = usePhoneNumberEntryStyles()

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

	const form = useFormContext()

	// const phoneFormatter = useMemo(() => new AsYouType(selectedCountry), [selectedCountry])
	const phoneFormatter = new AsYouType(selectedCountry)
	useEffect(() => {
		// if (form.values.phoneCountryId) {
		console.log('useEffect country')
		const { data } = countryList.find(({ value }) => value === form.values.phoneCountryId) ?? {}
		if (data?.cca2 && isValidCountry(data.cca2)) setSelectedCountry(data.cca2)
		else if (data === undefined) setSelectedCountry(undefined)
		// }

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.values.phoneCountryId])

	useEffect(() => {
		if (form.values.phoneNumber) {
			phoneFormatter.input(form.values.phoneNumber)
			const phoneCountry = phoneFormatter.getNumber()?.country
			console.log('🚀 ~ file: fields.tsx:89 ~ useEffect ~ phoneCountry:', phoneFormatter.getNumber())
			if (phoneCountry && phoneCountry !== selectedCountry) {
				const countryId = countryList.find(({ data }) => data.cca2 === phoneCountry)?.value
				console.log('🚀 ~ file: fields.tsx:92 ~ useEffect ~ countryId:', countryId)
				if (countryId) {
					setSelectedCountry(phoneCountry)
					form.setFieldValue('phoneCountryId', countryId)
				} else {
					form.setFieldError('phoneNumber', `Country not active: ${phoneCountry}`)
				}
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.values.phoneNumber])
	console.log({ raw: form.values, transformed: form.getTransformedValues() })

	return (
		<Group noWrap>
			<Select
				data={countryList}
				itemComponent={PhoneCountrySelectItem}
				// withinPortal
				clearable
				classNames={classes}
				{...form.getInputProps('phoneCountryId')}
			/>
			<PhoneInput
				country={selectedCountry}
				{...form.getInputProps('phoneNumber')}
				inputComponent={TextInput}
			/>
			{/* <TextInput {...form.getInputProps('phoneNumber')} /> */}
		</Group>
	)
}
