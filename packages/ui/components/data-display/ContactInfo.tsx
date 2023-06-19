import { Stack, Text, Title } from '@mantine/core'
import { useTranslation } from 'next-i18next'

import { api } from '~app/utils/api'
import { isExternal, Link } from '~ui/components/core/Link'
import { isSocialIcon, SocialLink, type SocialLinkProps } from '~ui/components/core/SocialLink'
import { parsePhoneNumber, useCustomVariant, useSlug } from '~ui/hooks'

const PhoneNumbers = ({ parentId, direct, locationOnly }: PhoneNumbersProps) => {
	const output: JSX.Element[] = []
	const slug = useSlug()
	const { t } = useTranslation(['common', 'phone-type'])
	const variants = useCustomVariant()
	const { data, isLoading } = api.orgPhone.forContactInfo.useQuery({ parentId, locationOnly })
	let k = 0

	if (!data?.length) return null

	for (const phone of data) {
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

const Emails = ({ parentId, direct, locationOnly, serviceOnly }: EmailsProps) => {
	const output: JSX.Element[] = []
	const slug = useSlug()
	const { t } = useTranslation(['common', slug, 'user-title'])
	const variants = useCustomVariant()
	const { data, isLoading } = api.orgEmail.forContactInfo.useQuery({ parentId, locationOnly, serviceOnly })
	let k = 0

	if (!data?.length) return null

	for (const email of data) {
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

const Websites = ({ parentId, direct, locationOnly, websiteDesc }: WebsitesProps) => {
	const output: JSX.Element[] = []
	const slug = useSlug()
	const { t } = useTranslation(['common', slug])
	const variants = useCustomVariant()
	const { data, isLoading } = api.orgWebsite.forContactInfo.useQuery({ parentId, locationOnly })
	// eslint-disable-next-line no-useless-escape
	const domainExtract = /https?:\/\/([^:\/\n?]+)/

	if (!data?.length) return null

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

const SocialMedia = ({ parentId, locationOnly }: SocialMediaProps) => {
	const { data, isLoading } = api.orgSocialMedia.forContactInfo.useQuery({ parentId, locationOnly })
	if (!data?.length) return null
	const items: SocialLinkProps[] = []

	for (const item of data) {
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
	parentId,
	order = ['website', 'phone', 'email', 'socialMedia'],
	gap = 24,
	...commonProps
}: ContactInfoProps) => {
	const sections: ContactMap = {
		website: <Websites key='Websites' parentId={parentId} {...commonProps} />,
		phone: <PhoneNumbers key='PhoneNumbers' parentId={parentId} {...commonProps} />,
		email: <Emails key='Emails' parentId={parentId} {...commonProps} />,
		socialMedia: <SocialMedia key='SocialMedia' parentId={parentId} />,
	}
	const items = order.map((item) => sections[item])
	return <Stack spacing={gap}>{items}</Stack>
}

export const hasContactInfo = (parentId: string) => {
	const [phones, emails, websites, socialMedia] = api.useQueries((t) => [
		t.orgPhone.forContactInfo({ parentId }),
		t.orgEmail.forContactInfo({ parentId }),
		t.orgWebsite.forContactInfo({ parentId }),
		t.orgSocialMedia.forContactInfo({ parentId }),
	])

	return Boolean(
		websites.data?.length || phones.data?.length || emails.data?.length || socialMedia.data?.length
	)
}

type ContactSections = 'phone' | 'email' | 'website' | 'socialMedia'

type ContactMap = {
	[K in ContactSections]: JSX.Element
}

export interface ContactInfoProps extends CommonProps {
	order?: ContactSections[]
	gap?: number
}

interface CommonProps {
	parentId: string
	direct?: boolean
	locationOnly?: boolean
	serviceOnly?: boolean
	websiteDesc?: boolean
}

type PhoneNumbersProps = CommonProps
type WebsitesProps = CommonProps

type EmailsProps = CommonProps
type SocialMediaProps = CommonProps
