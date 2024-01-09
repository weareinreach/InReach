import { Stack, Text, Title } from '@mantine/core'
import { useTranslation } from 'next-i18next'
import { type ReactElement } from 'react'

import { isExternal, Link } from '~ui/components/core/Link'
import { PhoneDrawer } from '~ui/components/data-portal/PhoneDrawer'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { parsePhoneNumber } from '~ui/hooks/usePhoneNumber'
import { useSlug } from '~ui/hooks/useSlug'
import { trpc as api } from '~ui/lib/trpcClient'

import { type PhoneNumbersProps } from './types'

export const PhoneNumbers = ({ edit, ...props }: PhoneNumbersProps) =>
	edit ? <PhoneNumbersEdit {...props} /> : <PhoneNumbersDisplay {...props} />

const PhoneNumbersDisplay = ({ parentId = '', passedData, direct, locationOnly }: PhoneNumbersProps) => {
	const output: ReactElement[] = []
	const slug = useSlug()
	const { data: orgId } = api.organization.getIdFromSlug.useQuery({ slug })
	const { t } = useTranslation(orgId?.id ? ['common', 'phone-type', orgId.id] : ['common', 'phone-type'])
	const variants = useCustomVariant()
	const { data } = api.orgPhone.forContactInfo.useQuery({ parentId, locationOnly }, { enabled: !passedData })

	const componentData = passedData ? passedData : data

	if (!componentData?.length) return null

	for (const phone of componentData) {
		const { country, ext, locationOnly: showLocationOnly, number, phoneType, primary, description } = phone
		const parsedPhone = parsePhoneNumber(number, country)
		if (!parsedPhone) continue
		if (ext) parsedPhone.setExt(ext)
		const dialURL = parsedPhone.getURI()
		const phoneNumber = parsedPhone.formatNational()
		if (direct) {
			return (
				<Stack spacing={12}>
					<Title order={3}>{t('direct.phone')}</Title>
					{isExternal(dialURL) ? (
						<Link external href={dialURL} variant={variants.Link.inlineInverted}>
							{phoneNumber}
						</Link>
					) : (
						<Text>{phoneNumber}</Text>
					)}
				</Stack>
			)
		}
		if (locationOnly && !showLocationOnly) continue
		const desc = description
			? t(description.key, { ns: orgId?.id, defaultValue: description.defaultText })
			: phoneType?.key
				? t(phoneType.key, { ns: 'phone-type' })
				: undefined

		const item = (
			<Stack spacing={4} key={phone.id}>
				{isExternal(dialURL) ? (
					<Link external href={dialURL} variant={variants.Link.inlineInverted}>
						{phoneNumber}
					</Link>
				) : (
					<Text>{phoneNumber}</Text>
				)}
				{desc && <Text variant={variants.Text.utility4darkGray}>{desc}</Text>}
			</Stack>
		)
		primary ? output.unshift(item) : output.push(item)
	}
	return (
		<Stack spacing={12}>
			<Title order={3}>{t('words.phone')}</Title>
			{output}
		</Stack>
	)
}

const PhoneNumbersEdit = ({ parentId = '', passedData, direct }: PhoneNumbersProps) => {
	const output: ReactElement[] = []
	const slug = useSlug()
	const { data: orgId } = api.organization.getIdFromSlug.useQuery({ slug })
	const { t } = useTranslation(orgId?.id ? ['common', 'phone-type', orgId.id] : ['common', 'phone-type'])
	const variants = useCustomVariant()
	const { data } = api.orgPhone.forContactInfoEdit.useQuery({ parentId }, { enabled: !passedData })

	const componentData = passedData ? passedData : data

	if (!componentData?.length) return null

	for (const phone of componentData) {
		const { country, ext, number, phoneType, primary, description } = phone
		const parsedPhone = parsePhoneNumber(number, country)
		if (!parsedPhone) continue
		if (ext) parsedPhone.setExt(ext)
		const dialURL = parsedPhone.getURI()
		const phoneNumber = parsedPhone.formatNational()
		if (direct) {
			return (
				<Stack spacing={12}>
					<Title order={3}>{t('direct.phone')}</Title>
					{isExternal(dialURL) ? (
						<Link external href={dialURL} variant={variants.Link.inlineInverted}>
							{phoneNumber}
						</Link>
					) : (
						<Text>{phoneNumber}</Text>
					)}
				</Stack>
			)
		}
		const desc = description
			? t(description.key, { ns: orgId?.id, defaultValue: description.defaultText })
			: phoneType?.key
				? t(phoneType.key, { ns: 'phone-type' })
				: undefined

		const item = (
			<Stack spacing={4} key={phone.id}>
				<PhoneDrawer id={phone.id} component={Link} variant={variants.Link.inlineInverted}>
					{phoneNumber}
				</PhoneDrawer>
				{desc && <Text variant={variants.Text.utility4darkGray}>{desc}</Text>}
			</Stack>
		)
		primary ? output.unshift(item) : output.push(item)
	}
	return (
		<Stack spacing={12}>
			<Title order={3}>{t('words.phone')}</Title>
			{output}
		</Stack>
	)
}
