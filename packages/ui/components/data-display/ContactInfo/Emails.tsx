import { Group, Menu, Stack, Text, Title, useMantineTheme } from '@mantine/core'
import compact from 'just-compact'
import { useTranslation } from 'next-i18next'
import { type ReactElement } from 'react'

import { isIdFor } from '@weareinreach/db/lib/idGen'
import { isExternal, Link } from '~ui/components/core/Link'
import { EmailDrawer } from '~ui/components/data-portal/EmailDrawer'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { useOrgInfo } from '~ui/hooks/useOrgInfo'
import { useSlug } from '~ui/hooks/useSlug'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { useCommonStyles } from './common.styles'
import { type EmailsProps } from './types'

export const Emails = ({ edit, ...props }: EmailsProps) =>
	edit ? <EmailsEdit {...props} /> : <EmailsDisplay {...props} />

const EmailsDisplay = ({ parentId = '', passedData, direct, locationOnly, serviceOnly }: EmailsProps) => {
	const output: ReactElement[] = []
	const { id: orgId } = useOrgInfo()
	const { t } = useTranslation(orgId ? ['common', orgId, 'user-title'] : ['common', 'user-title'])
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
				? t(description.key, { defaultValue: description.defaultText, ns: orgId })
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

const EmailsEdit = ({ parentId = '' }: EmailsProps) => {
	const slug = useSlug()
	const apiUtils = api.useUtils()
	const { data: orgId } = api.organization.getIdFromSlug.useQuery({ slug })
	const { t } = useTranslation(orgId?.id ? ['common', orgId.id, 'user-title'] : ['common', 'user-title'])
	const variants = useCustomVariant()
	const theme = useMantineTheme()
	const { classes } = useCommonStyles()
	const { data } = api.orgEmail.forContactInfoEdit.useQuery({ parentId })
	const isLocation = isIdFor('orgLocation', parentId)
	const { data: linkableEmails } = api.orgEmail.getLinkOptions.useQuery(
		{ slug, locationId: parentId },
		{
			enabled: isLocation,
		}
	)
	const linkToLocation = api.orgEmail.locationLink.useMutation({
		onSuccess: () => apiUtils.orgEmail.invalidate(),
	})

	const output = data?.map((email) => {
		const { primary: _primary, title, description, email: address, published, deleted, id } = email

		const desc = title
			? t(title.key, { ns: 'user-title' })
			: description?.key
				? t(description.key, { defaultValue: description.defaultText, ns: orgId?.id })
				: undefined

		const renderItem = () => {
			switch (true) {
				case deleted: {
					return {
						email: (
							<Group spacing={4} noWrap>
								<Text variant={variants.Text.darkGrayStrikethru}>{address}</Text>
							</Group>
						),
						desc: desc ? <Text variant={variants.Text.utility4darkGrayStrikethru}>{desc}</Text> : null,
					}
				}
				case !published: {
					return {
						email: (
							<Group spacing={4} noWrap>
								<Icon icon='carbon:view-off' color={theme.other.colors.secondary.darkGray} height={24} />
								<Text variant={variants.Text.darkGray}>{address}</Text>
							</Group>
						),
						desc: desc ? <Text variant={variants.Text.utility4darkGray}>{desc}</Text> : null,
					}
				}
				default: {
					return {
						email: <Text>{address}</Text>,
						desc: desc ? <Text variant={variants.Text.utility4darkGray}>{desc}</Text> : null,
					}
				}
			}
		}

		const item = (
			<Stack spacing={4} key={id}>
				<EmailDrawer id={id} external component={Link} variant={variants.Link.inlineInverted}>
					{renderItem().email}
				</EmailDrawer>
				{renderItem().desc}
			</Stack>
		)
		return item
	})

	const addOrLink = isLocation ? (
		<Menu keepMounted>
			<Menu.Target>
				<Link variant={variants.Link.inlineInverted}>
					<Group noWrap spacing={4}>
						<Icon icon='carbon:document-add' height={20} />
						<Text variant={variants.Text.utility3}>Link or create new...</Text>
					</Group>
				</Link>
			</Menu.Target>
			<Menu.Dropdown>
				{linkableEmails?.map(({ id, deleted, description, email, firstName, lastName, published }) => {
					const emailTextVariant =
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
								linkToLocation.mutate({ orgLocationId: parentId, orgEmailId: id, action: 'link' })
							}
						>
							<Group noWrap>
								<Icon icon='carbon:link' />
								<Stack spacing={0}>
									<Text variant={emailTextVariant}>{email}</Text>
									{(Boolean(firstName) || Boolean(lastName)) && (
										<Text variant={descTextVariant}>{compact([firstName, lastName]).join(' ')}</Text>
									)}
									<Text variant={descTextVariant}>{description}</Text>
								</Stack>
							</Group>
						</Menu.Item>
					)
				})}
				<Menu.Divider />
				<Menu.Item key='new'>
					<EmailDrawer key='new' component={Link} external variant={variants.Link.inlineInverted} createNew>
						<Group noWrap>
							<Icon icon='carbon:add-alt' />
							<Text variant={variants.Text.utility3}>Create new</Text>
						</Group>
					</EmailDrawer>
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	) : (
		<EmailDrawer key='new' component={Link} external variant={variants.Link.inlineInverted} createNew>
			<Group noWrap>
				<Icon icon='carbon:add' />
				<Text variant={variants.Text.utility3}>Create new</Text>
			</Group>
		</EmailDrawer>
	)

	return (
		<Stack spacing={12}>
			<Title order={3}>{t('words.email')}</Title>
			<Stack spacing={12} className={classes.overlay}>
				{output}
				<Stack spacing={4}>{addOrLink}</Stack>
			</Stack>
		</Stack>
	)
}
