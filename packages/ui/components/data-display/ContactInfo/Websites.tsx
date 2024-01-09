import { Stack, Title } from '@mantine/core'
import { useTranslation } from 'next-i18next'
import { type ReactElement } from 'react'

import { isExternal, Link } from '~ui/components/core/Link'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { useSlug } from '~ui/hooks/useSlug'
import { trpc as api } from '~ui/lib/trpcClient'

import { type WebsitesProps } from './types'

export const Websites = ({ parentId = '', passedData, direct, locationOnly, websiteDesc }: WebsitesProps) => {
	const output: ReactElement[] = []
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
				? t(description.key, { ns: orgId?.id, defaultText: description.defaultText })
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
