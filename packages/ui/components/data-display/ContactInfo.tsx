import { Stack, Text, Title } from '@mantine/core'
import { useTranslation } from 'next-i18next'

import { type ApiOutput } from '@weareinreach/api'
import { api } from '~app/utils/api'
import { isExternal, Link } from '~ui/components/core/Link'
import { isSocialIcon, SocialLink, type SocialLinkProps } from '~ui/components/core/SocialLink'
import { parsePhoneNumber, useCustomVariant, useSlug } from '~ui/hooks'

const PhoneNumbers = ({ parentId = '', passedData, direct, locationOnly }: PhoneNumbersProps) => {
	const output: JSX.Element[] = []
	const slug = useSlug()
	const { t } = useTranslation(['common', 'phone-type'])
	const variants = useCustomVariant()
	const { data } = api.orgPhone.forContactInfo.useQuery({ parentId, locationOnly }, { enabled: !passedData })
	let k = 0

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
			? t(description.key, { ns: slug, defaultValue: description.defaultText })
			: phoneType?.key
			? t(phoneType.key, { ns: 'phone-type' })
			: undefined

		const item = (
			<Stack spacing={4} key={k}>
				{isExternal(dialURL) ? (
					<Link key={k} external href={dialURL} variant={variants.Link.inlineInverted}>
						{phoneNumber}
					</Link>
				) : (
					<Text>{phoneNumber}</Text>
				)}
				{desc && <Text variant={variants.Text.utility4darkGray}>{desc}</Text>}
			</Stack>
		)
		primary ? output.unshift(item) : output.push(item)
		k++
	}
	return (
		<Stack spacing={12}>
			<Title order={3}>{t('words.phone')}</Title>
			{output}
		</Stack>
	)
}

const Emails = ({ parentId = '', passedData, direct, locationOnly, serviceOnly }: EmailsProps) => {
	const output: JSX.Element[] = []
	const slug = useSlug()
	const { data: orgId } = api.organization.getIdFromSlug.useQuery({ slug })
	const { t } = useTranslation(orgId?.id ? ['common', orgId.id, 'user-title'] : ['common', 'user-title'])
	const variants = useCustomVariant()
	const { data } = api.orgEmail.forContactInfo.useQuery(
		{ parentId, locationOnly, serviceOnly },
		{ enabled: !passedData }
	)
	let k = 0

	const componentData = passedData ? passedData : data

	if (!componentData?.length) return null

	for (const email of componentData) {
		const {
			primary,
			title,
			description,
			email: address,
			locationOnly: showLocOnly,
			serviceOnly: showServOnly,
		} = email
		if ((locationOnly && !showLocOnly) || (serviceOnly && !showServOnly)) continue

		const href = `mailto:${address}`
		if (!isExternal(href)) continue
		if (direct) {
			return (
				<Stack spacing={12}>
					<Title order={3}>{t('direct.email')}</Title>
					<Link external href={href} variant={variants.Link.inlineInverted}>
						{address}
					</Link>
				</Stack>
			)
		}
		const desc = title
			? t(title.key, { ns: 'user-title' })
			: description?.key
			? t(description.key, { defaultValue: description.defaultText, ns: slug })
			: undefined

		const item = (
			<Stack spacing={4} key={k}>
				<Link key={k} external href={href} variant={variants.Link.inlineInverted}>
					{address}
				</Link>
				{desc && <Text variant={variants.Text.utility4darkGray}>{desc}</Text>}
			</Stack>
		)
		primary ? output.unshift(item) : output.push(item)
		k++
	}
	return (
		<Stack spacing={12}>
			<Title order={3}>{t('words.email')}</Title>
			{output}
		</Stack>
	)
}

const Websites = ({ parentId = '', passedData, direct, locationOnly, websiteDesc }: WebsitesProps) => {
	const output: JSX.Element[] = []
	const slug = useSlug()
	const { data: orgId } = api.organization.getIdFromSlug.useQuery({ slug })
	const { t } = useTranslation(orgId?.id ? ['common', orgId.id] : ['common'])
	const variants = useCustomVariant()
	const { data } = api.orgWebsite.forContactInfo.useQuery(
		{ parentId, locationOnly },
		{ enabled: !passedData }
	)
	// eslint-disable-next-line no-useless-escape
	const domainExtract = /https?:\/\/([^:\/\n?]+)/

	const componentData = passedData ? passedData : data

	if (!componentData?.length) return null

	for (const website of componentData) {
		const { id, url, orgLocationOnly, description, isPrimary } = website
		const urlMatch = url.match(domainExtract)
		const urlBase = urlMatch?.length ? urlMatch[1] : undefined
		if (!isExternal(url)) continue
		if (!urlBase) continue
		if (locationOnly && !orgLocationOnly) continue

		if (direct) {
			return (
				<Stack spacing={12}>
					<Title order={3}>{t('direct.website')}</Title>
					<Link external href={url} variant={variants.Link.inlineInverted}>
						{urlBase}
					</Link>
				</Stack>
			)
		}

		const desc = websiteDesc
			? description?.key
				? t(description.key, { ns: slug, defaultText: description.defaultText })
				: urlBase
			: urlBase
		const item = (
			<Link external key={id} href={url} variant={variants.Link.inline}>
				{desc}
			</Link>
		)
		isPrimary ? output.unshift(item) : output.push(item)
	}

	if (!output.length) return null

	return (
		<Stack spacing={12}>
			<Title order={3}>{t('website', { count: output.length })}</Title>
			{output}
		</Stack>
	)
}

const SocialMedia = ({ parentId = '', passedData, locationOnly }: SocialMediaProps) => {
	const { data } = api.orgSocialMedia.forContactInfo.useQuery(
		{ parentId, locationOnly },
		{ enabled: !passedData }
	)

	const componentData = passedData ? passedData : data

	if (!componentData?.length) return null
	const items: SocialLinkProps[] = []

	for (const item of componentData) {
		const icon = item.service.toLowerCase()
		if (!isSocialIcon(icon)) continue
		items.push({
			icon,
			href: item.url,
			title: item.username,
		})
	}
	if (!items.length) return null
	return <SocialLink.Group links={items} header />
}

export const ContactInfo = ({
	passedData,
	parentId,
	order = ['website', 'phone', 'email', 'socialMedia'],
	gap = 24,
	...commonProps
}: ContactInfoProps) => {
	const sections: ContactMap = {
		website: (
			<Websites
				key='Websites'
				{...commonProps}
				{...(passedData ? { passedData: passedData.websites } : { parentId })}
			/>
		),
		phone: (
			<PhoneNumbers
				key='PhoneNumbers'
				{...commonProps}
				{...(passedData ? { passedData: passedData.phones } : { parentId })}
			/>
		),
		email: (
			<Emails
				key='Emails'
				{...commonProps}
				{...(passedData ? { passedData: passedData.emails } : { parentId })}
			/>
		),
		socialMedia: (
			<SocialMedia
				key='SocialMedia'
				{...commonProps}
				{...(passedData ? { passedData: passedData.socialMedia } : { parentId })}
			/>
		),
	}
	const items = order.map((item) => sections[item])
	return <Stack spacing={gap}>{items}</Stack>
}

export const hasContactInfo = (data: PassedDataObject) => {
	const { websites, phones, emails, socialMedia } = data
	return Boolean(websites.length || phones.length || emails.length || socialMedia.length)
}

type ContactSections = 'phone' | 'email' | 'website' | 'socialMedia'

type ContactMap = {
	[K in ContactSections]: JSX.Element
}

export type ContactInfoProps = CommonProps & {
	order?: ContactSections[]
	gap?: number
} & (ApiData | PassedDataProps)

interface CommonProps {
	direct?: boolean
	locationOnly?: boolean
	serviceOnly?: boolean
	websiteDesc?: boolean
}

type PhoneNumbersProps = CommonProps & (ApiData | PassedData<'orgPhone', 'forContactInfo'>)
type WebsitesProps = CommonProps & (ApiData | PassedData<'orgWebsite', 'forContactInfo'>)

type EmailsProps = CommonProps & (ApiData | PassedData<'orgEmail', 'forContactInfo'>)
type SocialMediaProps = CommonProps & (ApiData | PassedData<'orgSocialMedia', 'forContactInfo'>)

type PassedData<K1 extends keyof ApiOutput, K2 extends keyof ApiOutput[K1]> = {
	passedData: ApiOutput[K1][K2]
	parentId?: never
}

export interface PassedDataObject {
	phones: ApiOutput['orgPhone']['forContactInfo']
	emails: ApiOutput['orgEmail']['forContactInfo']
	websites: ApiOutput['orgWebsite']['forContactInfo']
	socialMedia: ApiOutput['orgSocialMedia']['forContactInfo']
}
type ApiData = {
	parentId: string
	passedData?: never
}
type PassedDataProps = {
	passedData: PassedDataObject
	parentId?: never
}
