import { Card, Checkbox, Select, Stack, Text } from '@mantine/core'
import { useTranslation } from 'next-i18next'
import { useEffect, useState } from 'react'

import { MultiSelectPopover } from '~ui/components/data-portal/MultiSelectPopover'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { useOrgInfo } from '~ui/hooks/useOrgInfo'
import { useSlug } from '~ui/hooks/useSlug'
import { trpc as api } from '~ui/lib/trpcClient'

import { useFormContext } from './context'

// #region Phone Type Select

interface PhoneTypeSelectItem {
	label: string
	value: string
}
export const PhoneTypeSelect = () => {
	const [options, setOptions] = useState<PhoneTypeSelectItem[]>([])
	const { t } = useTranslation(['phone-type'])
	const form = useFormContext()
	api.fieldOpt.phoneTypes.useQuery(undefined, {
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
	const variants = useCustomVariant()
	const slug = useSlug()
	const { data: orgId } = api.organization.getIdFromSlug.useQuery({ slug })
	const { t } = useTranslation(orgId?.id)
	const { id: organizationId } = useOrgInfo()

	const { data: serviceData, isLoading: isServiceLoading } = api.service.getNames.useQuery(
		{ organizationId },
		{
			enabled: Boolean(organizationId),

			// !fix when issue resolved.
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

			// !fix when issue resolved.
			select: (data) => data.map(({ id, name }) => ({ value: id, label: name ?? 'Missing Name' })),
		}
	)

	useEffect(() => {
		if (serviceData && !isServiceLoading && !compareArrays(serviceData, services)) {
			// !fix when issue resolved.
			setServices(serviceData)
		}
	}, [serviceData, isServiceLoading, services])
	useEffect(() => {
		if (locationData && !isLocationLoading && !compareArrays(locationData, locations)) {
			// !fix when issue resolved.
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
