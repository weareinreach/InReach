import { Stack, Title, Text, Card } from '@mantine/core'
import { type ApiOutput } from '@weareinreach/api'
import parsePhoneNumber, { type CountryCode } from 'libphonenumber-js'
import { useRouter } from 'next/router'
import { TFunction, useTranslation } from 'next-i18next'
import { ReactNode } from 'react'
import { z } from 'zod'

import { Link, isExternal, SocialLink, SocialLinkProps } from '~ui/components/core'
import { useCustomVariant, useScreenSize } from '~ui/hooks'

const urlValid = (url: unknown): url is `http${string}` => {
	const result = z.string().url().safeParse(url)
	return result.success
}

const WebsiteList = ({ role, websites, t }: WebsiteListProps) => {
	const variants = useCustomVariant()
	const domainExtract = /https?:\/\/([^:\/\n?]+)/
	const sites: JSX.Element[] = []
	try {
		for (const site of websites) {
			const urlBase = site.url.match(domainExtract)
			if (!urlValid(site.url)) continue
			if (!urlBase) continue
			if (role === 'org' && (site.orgLocationOnly || site.orgLocationId)) continue
			const addItem = (item: (typeof sites)[number]) =>
				site.isPrimary && sites.length > 1 ? sites.unshift(item) : sites.push(item)

			const description = `${
				urlBase[1]
				// site.description?.key
				// 	? t(site.description.key, { defaultText: site.description.tsKey.text })
				// 	: urlBase[1]
			}`
			const linkProps = {
				key: site.id,
				href: site.url,
				external: true,
				variant: variants.Link.inline,
			}
			const link = <Link {...linkProps}>{description}</Link>
			addItem(link)
		}
		if (!sites.length) return <></>

		return (
			<Stack>
				<Title order={3}>{t('website')}</Title>
				{sites}
			</Stack>
		)
	} catch (error) {
		console.log(error)
		if (error instanceof Error) console.error(error.message, error.cause)
		return <>{JSON.stringify({ error, sites })}</>
	}
}
const Item = ({ heading, href, subheading }: { heading: string; href: string; subheading?: string }) => {
	const variants = useCustomVariant()
	if (!isExternal(href)) return null
	return (
		<Stack spacing={4}>
			<Link external href={href} variant={variants.Link.inlineInverted}>
				{heading}
			</Link>
			{Boolean(subheading) && <Text variant={variants.Text.utility4darkGray}>{subheading}</Text>}
		</Stack>
	)
}

const ItemListWithSubtext = (props: SubtextList) => {
	const { role, dataType, data, t, slug } = props
	const items: ReactNode[] = []
	if (!data.length) return null

	const isEmail = (dataType: string, data: unknown): data is EmailList['data'] => dataType === 'email'

	switch (dataType) {
		case 'phone': {
			for (const { phone } of data) {
				const addItem = (item: ReactNode) => (phone.primary ? items.unshift(item) : items.push(item))
				const parsedPhone = parsePhoneNumber(phone.number, phone.country.cca2 as CountryCode)
				if (!parsedPhone) continue
				const phoneNumber = parsedPhone.formatNational()
				const desc = phone.phoneType?.tsKey ? t(phone.phoneType.tsKey, { ns: 'phone-type' }) : undefined
				const href = parsedPhone.getURI()
				const itemProps = { heading: phoneNumber, href, subheading: desc }
				const item = <Item key={phone.number} {...itemProps} />
				addItem(item)
			}
			break
		}
		case 'email':
			{
				if (!isEmail(dataType, data)) return null
				for (const { email } of data) {
					const addItem = (item: ReactNode) => (email.primary ? items.unshift(item) : items.push(item))

					const desc = email.title
						? t(email.title.tsKey)
						: email.description?.key
						? t(email.description.key, { defaultValue: email.description.tsKey.text, ns: slug })
						: undefined
					const href = `mailto:${email.email}`

					const itemProps = { heading: email.email, href, subheading: desc }

					items.push(<Item key={email.email} {...itemProps} />)
				}
			}
			break
	}
	if (!items) return null
	return (
		<Stack spacing={12}>
			<Title order={3}>{t(dataType)}</Title>
			{...items}
		</Stack>
	)
}

export const ContactSection = (props: ContactSectionProps) => {
	const router = useRouter<'/org/[slug]' | '/org/[slug]/[orgLocationId]'>()
	const { slug } = router.query
	const { t } = useTranslation(['common', slug, 'phone-type'])
	const { role } = props
	const { isMobile } = useScreenSize()
	const { emails, phones, socialMedia, websites } = props.data
	const hasData = (dataType: (typeof props.data)[keyof typeof props.data]) => Boolean(dataType.length > 0)

	const socialLinks: SocialLinkProps[] = socialMedia.map((item) => ({
		icon: item.service.name.toLowerCase() as SocialLinkProps['icon'],
		href: item.url,
		title: item.username,
	}))
	const body = (
		<Stack spacing={isMobile ? 32 : 40}>
			<Title order={2}>{t('contact')}</Title>
			<WebsiteList role={role} websites={websites} t={t} />
			<ItemListWithSubtext role={role} dataType='phone' data={phones} t={t} slug={slug} />
			<ItemListWithSubtext role={role} dataType='email' data={emails} t={t} slug={slug} />
			<SocialLink.Group links={socialLinks} header />
		</Stack>
	)
	return isMobile ? body : <Card>{body}</Card>
}

type PageQueryResult = NonNullable<ApiOutput['organization']['getBySlug']>

export type ContactSectionProps = OrganizationContact | LocationContact

type OrganizationContact = {
	role: 'org'
	data: {
		websites: PageQueryResult['websites']
		phones: PageQueryResult['phones']
		emails: PageQueryResult['emails']
		socialMedia: PageQueryResult['socialMedia']
	}
}
type Location = NonNullable<PageQueryResult['locations']>[number]

type LocationContact = {
	role: 'location'
	data: {
		websites: Location['websites']
		phones: Location['phones']
		emails: Location['emails']
		socialMedia: Location['socialMedia']
	}
}
type SectionRole = LocationContact['role'] | OrganizationContact['role']

type LocationData = NonNullable<LocationContact['data'] | OrganizationContact['data']>

type WebsiteListProps = {
	role: SectionRole
	websites: LocationData['websites']
	t: TFunction
}

type WebsiteList = {
	role: SectionRole
	dataType: 'website'
	websites: LocationData['websites']
	t: TFunction
}

type PhoneList = {
	role: SectionRole
	dataType: 'phone'
	data: PageQueryResult['phones'] | Location['phones']
	t: TFunction
	slug: string
}
type EmailList = {
	role: SectionRole
	dataType: 'email'
	data: PageQueryResult['emails'] | Location['emails']
	t: TFunction
	slug: string
}
type SubtextList = PhoneList | EmailList
