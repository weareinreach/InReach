import { Card, Checkbox, createStyles, Group, rem, Select, Stack, Text, TextInput } from '@mantine/core'
import { AsYouType, type CountryCode, isSupportedCountry } from 'libphonenumber-js'
import { useTranslation } from 'next-i18next'
import { type ComponentPropsWithoutRef, forwardRef, useEffect, useState } from 'react'
import PhoneInput from 'react-phone-number-input/input'

import { type ApiOutput } from '@weareinreach/api'
import { MultiSelectPopover } from '~ui/components/data-portal/MultiSelectPopover'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { useOrgId } from '~ui/hooks/useOrgId'
import { useSlug } from '~ui/hooks/useSlug'
import { trpc as api } from '~ui/lib/trpcClient'

import { useFormContext } from './context'

// #endregion

// #region flags/attachments

// #region Phone Number Entry
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

export const PhoneNumberEntry = () => {
	const [countryList, setCountryList] = useState<PhoneCountryItem[]>([])
	const [selectedCountry, setSelectedCountry] = useState<CountryCode | undefined>()
	const { classes: countrySelectClasses } = useCountrySelectStyles()
	const { classes: phoneEntryClasses } = usePhoneEntryStyles()

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
	const phoneFormatter = new AsYouType(selectedCountry)
	useEffect(() => {
		const { data } = countryList.find(({ value }) => value === form.values.phoneCountryId) ?? {}
		if (data?.cca2 && isValidCountry(data.cca2)) setSelectedCountry(data.cca2)
		else if (data === undefined) setSelectedCountry(undefined)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.values.phoneCountryId])

	useEffect(() => {
		if (form.values.phoneNumber) {
			phoneFormatter.input(form.values.phoneNumber)
			const phoneCountry = phoneFormatter.getNumber()?.country
			if (phoneCountry && phoneCountry !== selectedCountry) {
				const countryId = countryList.find(({ data }) => data.cca2 === phoneCountry)?.value
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

	const countrySelection = (
		<Select
			data={countryList}
			itemComponent={PhoneCountrySelectItem}
			classNames={countrySelectClasses}
			clearable
			{...form.getInputProps('phoneCountryId')}
		/>
	)

	return (
		<PhoneInput
			country={selectedCountry}
			defaultCountry='US'
			{...form.getInputProps('phoneNumber')}
			inputComponent={TextInput}
			rightSection={countrySelection}
			rightSectionWidth={56}
			classNames={phoneEntryClasses}
		/>
	)
}

// #endregion

// #region Phone Type Select

interface PhoneTypeSelectItem {
	label: string
	value: string
}
export const PhoneTypeSelect = () => {
	const [options, setOptions] = useState<PhoneTypeSelectItem[]>([])
	const { t } = useTranslation(['phone-type'])
	const form = useFormContext()
	api.fieldOpt.getPhoneTypes.useQuery(undefined, {
		onSuccess: (data) =>
			setOptions(data.map(({ id, tsKey, tsNs }) => ({ value: id, label: t(tsKey, { ns: tsNs }) }))),
	})

	//TODO: Alter dropdown component to match figma design
	return (
		<>
			<Select data={options} {...form.getInputProps('phoneTypeId')} />
		</>
	)
}

// #endregion

// #region flags/attachments

interface BasicSelect {
	value: string
	label: string
	[k: string]: string
}

const compareArrays = (arr1: unknown[] = [], arr2: unknown[] = []) =>
	JSON.stringify(arr1.sort()) === JSON.stringify(arr2.sort())

export const PhoneEmailFlags = ({ role }: PhoneEmailFlagsProps) => {
	const form = useFormContext()
	const [locations, setLocations] = useState<BasicSelect[]>()
	const [services, setServices] = useState<BasicSelect[]>()
	const slug = useSlug()
	const variants = useCustomVariant()
	const { t } = useTranslation([slug])
	const organizationId = useOrgId()

	const { data: serviceData, isLoading: isServiceLoading } = api.service.getNames.useQuery(
		{ organizationId },
		{
			enabled: Boolean(organizationId),
			select: (data) =>
				data.map(({ id, tsKey, defaultText }) => ({
					value: id,
					label: t(tsKey, { ns: slug, defaultValue: defaultText }),
				})),
		}
	)
	const { data: locationData, isLoading: isLocationLoading } = api.location.getNames.useQuery(
		{ organizationId: organizationId ?? '' },
		{
			enabled: Boolean(organizationId),
			select: (data) => data.map(({ id, name }) => ({ value: id, label: name ?? 'Missing Name' })),
		}
	)

	useEffect(() => {
		if (serviceData && !isServiceLoading && !compareArrays(serviceData, services)) {
			setServices(serviceData)
		}
	}, [serviceData, isServiceLoading, services])
	useEffect(() => {
		if (locationData && !isLocationLoading && !compareArrays(locationData, locations)) {
			setLocations(locationData)
		}
	}, [locationData, isLocationLoading, locations])

	return (
		<Card withBorder>
			<Stack>
				<Stack spacing={0}>
					<Text variant={variants.Text.utility1}>Primary</Text>
					<Checkbox
						label={`This is the primary ${
							role === 'email' ? 'email address' : 'phone number'
						} for this organization`}
						{...form.getInputProps('isPrimary', { type: 'checkbox' })}
					/>
				</Stack>
				<Stack spacing={0}>
					<Text variant={variants.Text.utility1}>Show on Organization</Text>
					<Checkbox
						label={`This ${
							role === 'email' ? 'email' : 'phone number'
						} should be shown on the organization page`}
						{...form.getInputProps('published', { type: 'checkbox' })}
					/>
				</Stack>
				<Stack spacing={0}>
					<Text variant={variants.Text.utility1}>Show on Locations</Text>
					{locations && locations.length > 1 ? (
						<MultiSelectPopover data={locations} label='Locations' {...form.getInputProps('orgLocationId')} />
					) : (
						<Text variant={variants.Text.utility4}>xx</Text>
					)}
				</Stack>
				<Stack spacing={0}>
					<Text variant={variants.Text.utility1}>Show on Services</Text>
					{services && services.length > 1 ? (
						<MultiSelectPopover data={services} label='Services' {...form.getInputProps('orgServiceId')} />
					) : (
						<Text variant={variants.Text.utility4}>xx</Text>
					)}
				</Stack>
			</Stack>
		</Card>
	)
}
interface PhoneEmailFlagsProps {
	role: 'phone' | 'email'
}

// #endregion
