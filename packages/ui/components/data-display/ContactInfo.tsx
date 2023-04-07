import { Stack, Text, Title } from '@mantine/core'
import { type ApiOutput } from '@weareinreach/api'
import { useTranslation } from 'next-i18next'

import { Link, isExternal, SocialLink, SocialLinkProps, isSocialIcon } from '~ui/components/core'
import { parsePhoneNumber, useSlug, useCustomVariant } from '~ui/hooks'

const PhoneNumbers = ({ data, direct, locationOnly }: PhoneNumbersProps) => {
	const output: JSX.Element[] = []
	const { t } = useTranslation(['common', 'phone-type'])
	const variants = useCustomVariant()
	let k = 0

	if (!data.length) return null

	for (const { phone } of data) {
		const { country, ext, locationOnly: showLocationOnly, number, phoneType, primary } = phone
		const parsedPhone = parsePhoneNumber(number, country.cca2)
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
		const desc = phoneType?.tsKey ? t(phoneType.tsKey, { ns: 'phone-type' }) : undefined

		const item = (
			<Stack spacing={12} key={k}>
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
		k++
	}
	return (
		<Stack spacing={12}>
			<Title order={3}>{t('words.phone')}</Title>
			{output}
		</Stack>
	)
}

const Emails = ({ data, direct, locationOnly, serviceOnly }: EmailsProps) => {
	const output: JSX.Element[] = []
	const slug = useSlug()
	const { t } = useTranslation(['common', slug, 'user-title'])
	const variants = useCustomVariant()
	let k = 0

	if (!data.length) return null

	for (const { email } of data) {
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
			? t(title.tsKey, { ns: 'user-title' })
			: description?.key
			? t(description.key, { defaultValue: description.tsKey.text, ns: slug })
			: undefined

		const item = (
			<Stack spacing={4} key={k}>
				<Link external href={href} variant={variants.Link.inlineInverted}>
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

const Websites = ({ data, direct, locationOnly, websiteDesc }: WebsitesProps) => {
	const output: JSX.Element[] = []
	const slug = useSlug()
	const { t } = useTranslation(['common', slug])
	const variants = useCustomVariant()
	const domainExtract = /https?:\/\/([^:\/\n?]+)/

	if (!data.length) return null

	for (const website of data) {
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
				? t(description.key, { ns: slug, defaultText: description.tsKey.text })
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

const SocialMedia = ({ data }: SocialMediaProps) => {
	if (!data.length) return null
	const items: SocialLinkProps[] = []

	for (const item of data) {
		const icon = item.service.name.toLowerCase()
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
	data,
	order = ['website', 'phone', 'email', 'socialMedia'],
	gap = 24,
	...commonProps
}: ContactInfoProps) => {
	const sections: ContactMap = {
		website: <Websites data={data.websites ?? []} {...commonProps} />,
		phone: <PhoneNumbers data={data.phones ?? []} {...commonProps} />,
		email: <Emails data={data.emails ?? []} {...commonProps} />,
		socialMedia: <SocialMedia data={data.socialMedia ?? []} />,
	}
	const items = order.map((item) => sections[item])
	return <Stack spacing={gap}>{items}</Stack>
}

export const hasContactInfo = (data: ContactInfoProps['data']) => {
	const { websites, phones, emails, socialMedia } = data
	return Boolean(websites.length || phones.length || emails.length || socialMedia.length)
}

type ContactSections = 'phone' | 'email' | 'website' | 'socialMedia'

type ContactMap = {
	[K in ContactSections]: JSX.Element
}

export interface ContactInfoProps extends CommonProps {
	data: {
		websites: WebsitesProps['data']
		phones: PhoneNumbersProps['data']
		emails: EmailsProps['data']
		socialMedia: SocialMediaProps['data']
	}
	order?: ContactSections[]
	gap?: number
}

interface CommonProps {
	direct?: boolean
	locationOnly?: boolean
	serviceOnly?: boolean
	websiteDesc?: boolean
}

interface PhoneNumbersProps extends CommonProps {
	data: PageQueryResult['phones'] | Location['phones']
}
interface WebsitesProps extends CommonProps {
	data: PageQueryResult['websites'] | Location['websites']
}

interface EmailsProps extends CommonProps {
	data: PageQueryResult['emails'] | Location['emails']
}
interface SocialMediaProps extends CommonProps {
	data: PageQueryResult['socialMedia'] | Location['socialMedia']
}

type PageQueryResult = NonNullable<ApiOutput['organization']['getBySlug']>
type Location = NonNullable<PageQueryResult['locations']>[number]
