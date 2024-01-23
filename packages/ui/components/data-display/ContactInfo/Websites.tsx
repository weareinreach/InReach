import { Group, Stack, Text, Title, useMantineTheme } from '@mantine/core'
import { useTranslation } from 'next-i18next'
import { type ReactElement } from 'react'

import { isExternal, Link } from '~ui/components/core/Link'
import { WebsiteDrawer } from '~ui/components/data-portal/WebsiteDrawer'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { useSlug } from '~ui/hooks/useSlug'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { useCommonStyles } from './common.styles'
import { type WebsitesProps } from './types'

export const Websites = ({ edit, ...props }: WebsitesProps) =>
	edit ? <WebsitesEdit {...props} /> : <WebsitesDisplay {...props} />

const WebsitesDisplay = ({ parentId = '', passedData, direct, locationOnly, websiteDesc }: WebsitesProps) => {
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

const WebsitesEdit = ({ parentId = '' }: WebsitesProps) => {
	const output: ReactElement[] = []
	const slug = useSlug()
	const { data: orgId } = api.organization.getIdFromSlug.useQuery({ slug })
	const { t } = useTranslation(orgId?.id ? ['common', orgId.id] : ['common'])
	const variants = useCustomVariant()
	const theme = useMantineTheme()
	const { classes } = useCommonStyles()
	const { data } = api.orgWebsite.forContactInfoEdit.useQuery({ parentId })
	// eslint-disable-next-line no-useless-escape
	const domainExtract = /https?:\/\/([^:\/\n?]+)/

	for (const website of data ?? []) {
		const { id, url, description, published, deleted } = website
		const urlMatch = url.match(domainExtract)
		const urlBase = urlMatch?.length ? urlMatch[1] : undefined
		if (!isExternal(url)) continue
		if (!urlBase) continue
		const desc = description?.key
			? t(description.key, { ns: orgId?.id, defaultText: description.defaultText })
			: urlBase

		const renderItem = () => {
			switch (true) {
				case deleted: {
					return <Text variant={variants.Text.darkGrayStrikethru}>{desc}</Text>
				}
				case !published: {
					return (
						<Group spacing={4} noWrap>
							<Icon icon='carbon:view-off' color={theme.other.colors.secondary.darkGray} height={24} />
							<Text variant={variants.Text.darkGray}>{desc}</Text>
						</Group>
					)
				}
				default: {
					return <Text>{desc}</Text>
				}
			}
		}

		const item = (
			<WebsiteDrawer component={Link} external key={id} id={id} variant={variants.Link.inline}>
				{renderItem()}
			</WebsiteDrawer>
		)
		output.push(item)
	}

	return (
		<Stack spacing={12}>
			<Title order={3}>{t('website', { count: output.length })}</Title>
			<Stack spacing={12} className={classes.overlay}>
				{output}
				<WebsiteDrawer component={Link} external variant={variants.Link.inlineInverted} createNew>
					<Text variant={variants.Text.utility3}>➕ Create new</Text>
				</WebsiteDrawer>
			</Stack>
		</Stack>
	)
}
