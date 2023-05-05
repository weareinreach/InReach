import { createStyles, Group, NativeSelect, rem, Select, Text, TextInput } from '@mantine/core'
import {
	type CountryCode,
	isPossiblePhoneNumber,
	isSupportedCountry,
	isValidPhoneNumber,
	validatePhoneNumberLength,
} from 'libphonenumber-js'
import { type ComponentPropsWithoutRef, forwardRef, useEffect, useState } from 'react'
import PhoneInput from 'react-phone-number-input/input'

import { type ApiOutput } from '@weareinreach/api'
import { trpc as api } from '~ui/lib/trpcClient'

import { useFormContext } from './context'

type CountryList = ApiOutput['fieldOpt']['countries']

interface PhoneCountrySelectItem extends ComponentPropsWithoutRef<'div'>, PhoneCountryItem {
	// label: string
	// value: string
	// data: Pick<CountryList[number], 'name' | 'cca2'>
}

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
	},
	input: {
		width: rem(72),
	},
}))
export const PhoneNumberEntry = () => {
	const [countryList, setCountryList] = useState<PhoneCountryItem[]>([])
	const [selectedCountry, setSelectedCountry] = useState<CountryCode>()
	const { classes } = usePhoneNumberEntryStyles()

	api.fieldOpt.countries.useQuery(
		{ where: { activeForOrgs: true } },
		{
			onSuccess: (data) =>
				setCountryList(
					data.map(({ id, flag, name, cca2 }) => ({
						value: id,
						label: `${flag} ${name}`,
						data: { name, cca2 },
					}))
				),
		}
	)

	const form = useFormContext()

	useEffect(() => {
		if (form.values.phoneCountryId) {
			const { data } = countryList.find(({ value }) => value === form.values.phoneCountryId) ?? {}
			if (data?.cca2 && isValidCountry(data.cca2)) setSelectedCountry(data.cca2)
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.values])

	return (
		<Group noWrap>
			<NativeSelect
				data={countryList}
				// itemComponent={PhoneCountrySelectItem}
				// withinPortal
				// classNames={classes}
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
