import { Group, Menu, Stack, Text, Title, useMantineTheme } from '@mantine/core'
import { useTranslation } from 'next-i18next'
import { type ReactElement } from 'react'

import { isIdFor } from '@weareinreach/db/lib/idGen'
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
	const slug = useSlug()
	const apiUtils = api.useUtils()
	const { data: orgId } = api.organization.getIdFromSlug.useQuery({ slug })
	const { t } = useTranslation(orgId?.id ? ['common', orgId.id] : ['common'])
	const variants = useCustomVariant()
	const theme = useMantineTheme()

	const { classes } = useCommonStyles()
	const { data } = api.orgWebsite.forContactInfoEdit.useQuery({ parentId })
	const isLocation = isIdFor('orgLocation', parentId)
	const { data: linkableWebsites } = api.orgWebsite.getLinkOptions.useQuery(
		{
			slug,
			locationId: parentId,
		},
		{ enabled: isLocation }
	)
	const linkToLocation = api.orgWebsite.locationLink.useMutation({
		onSuccess: () => apiUtils.orgWebsite.invalidate(),
	})
	// eslint-disable-next-line no-useless-escape
	const domainExtract = /https?:\/\/([^:\/\n?]+)/

	const output = data?.map((website) => {
		const { id, url, description, published, deleted } = website
		const urlMatch = url.match(domainExtract)
		const urlBase = urlMatch?.length ? urlMatch[1] : undefined
		if (!isExternal(url)) return null
		if (!urlBase) return null
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
		return item
	})

	const addOrLink = isLocation ? (
		<Menu keepMounted withinPortal>
			<Menu.Target>
				<Link variant={variants.Link.inlineInverted}>
					<Group noWrap spacing={4}>
						<Icon icon='carbon:document-add' height={20} />
						<Text variant={variants.Text.utility3}>Link or create new...</Text>
					</Group>
				</Link>
			</Menu.Target>
			<Menu.Dropdown>
				{linkableWebsites?.map(({ id, deleted, description, url, published }) => {
					const urlTextVariant =
						!published && deleted
							? variants.Text.utility3darkGrayStrikethru
							: deleted
								? variants.Text.utility3darkGrayStrikethru
								: variants.Text.utility3
					const descTextVariant =
						!published && deleted
							? variants.Text.utility4darkGrayStrikethru
							: deleted
								? variants.Text.utility4darkGrayStrikethru
								: variants.Text.utility4
					return (
						<Menu.Item
							key={id}
							onClick={() =>
								linkToLocation.mutate({ orgLocationId: parentId, orgWebsiteId: id, action: 'link' })
							}
						>
							<Group noWrap>
								<Icon icon='carbon:link' />
								<Stack spacing={0}>
									<Text variant={urlTextVariant}>{url}</Text>
									<Text variant={descTextVariant}>{description}</Text>
								</Stack>
							</Group>
						</Menu.Item>
					)
				})}
				<Menu.Divider />
				<Menu.Item key='new'>
					<WebsiteDrawer key='new' component={Link} external variant={variants.Link.inlineInverted} createNew>
						<Group noWrap>
							<Icon icon='carbon:add-alt' />
							<Text variant={variants.Text.utility3}>Create new</Text>
						</Group>
					</WebsiteDrawer>
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	) : (
		<WebsiteDrawer key='new' component={Link} external variant={variants.Link.inlineInverted} createNew>
			<Group noWrap>
				<Icon icon='carbon:add' />
				<Text variant={variants.Text.utility3}>Create new</Text>
			</Group>
		</WebsiteDrawer>
	)

	return (
		<Stack spacing={12}>
			<Title order={3}>{t('website', { count: output?.length ?? 1 })}</Title>
			<Stack spacing={12} className={classes.overlay}>
				{output}
				{addOrLink}
			</Stack>
		</Stack>
	)
}
