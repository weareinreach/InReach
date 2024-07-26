import { Group, Menu, Stack, Text, Title, useMantineTheme } from '@mantine/core'
import compact from 'just-compact'
import { useTranslation } from 'next-i18next'
import { type ReactElement, useCallback, useMemo } from 'react'
import invariant from 'tiny-invariant'

import { isIdFor } from '@weareinreach/db/lib/idGen'
import { isExternal, Link } from '~ui/components/core/Link'
import { EmailDrawer } from '~ui/components/data-portal/EmailDrawer'
import { AttributeEditWrapper } from '~ui/components/data-portal/ServiceEditDrawer/AttributeEditWrapper'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { useEditMode } from '~ui/hooks/useEditMode'
import { useOrgInfo } from '~ui/hooks/useOrgInfo'
import { useSlug } from '~ui/hooks/useSlug'
import { Icon } from '~ui/icon'
import { nsFormatter } from '~ui/lib/nsFormatter'
import { trpc as api } from '~ui/lib/trpcClient'

import { useCommonStyles } from './common.styles'
import { type EmailsProps } from './types'

const formatNs = nsFormatter(['common', 'user-title'])

const anyTrue = (...args: boolean[]) => args.some((x) => x)

export const Emails = ({ edit, ...props }: EmailsProps) =>
	edit ? <EmailsEdit {...props} /> : <EmailsDisplay {...props} />

const EmailsDisplay = ({
	parentId = '',
	passedData,
	direct,
	locationOnly = false,
	serviceOnly = false,
}: EmailsProps) => {
	const { id: orgId } = useOrgInfo()
	const { t } = useTranslation(formatNs(orgId))
	const variants = useCustomVariant()
	const { isEditMode } = useEditMode()
	const { data } = api.orgEmail.forContactInfo.useQuery(
		{ parentId, locationOnly, serviceOnly },
		{
			enabled: !passedData,
			select: (data) => data?.map((res) => ({ ...res, active: undefined })),
		}
	)
	const componentData = useMemo(() => passedData ?? data ?? [], [data, passedData])
	const { output: content, showDirectHeading: shouldShowDirectHeading } = useMemo(() => {
		const output: ReactElement[] = []
		let showDirectHeading = false
		for (const email of componentData) {
			const {
				id,
				primary,
				title,
				description,
				email: address,
				locationOnly: showLocOnly = false,
				serviceOnly: showServOnly = false,
			} = email
			const href = `mailto:${address}`
			if (anyTrue(locationOnly && !showLocOnly, serviceOnly && !showServOnly, !isExternal(href))) {
				continue
			}
			invariant(isExternal(href))
			if (direct) {
				showDirectHeading = true
			}
			const linkVariant = direct ? variants.Link.inlineInverted : variants.Link.inline

			const desc = (() => {
				if (title) {
					return t(title.key, { ns: 'user-title' })
				}
				if (description?.key) {
					return t(description.key, { defaultValue: description.defaultText, ns: orgId })
				}

				return null
			})()

			const item = isEditMode ? (
				<AttributeEditWrapper key={id} active={email.active ?? false} id={id}>
					<Stack spacing={4} key={id}>
						<Link external href={href} variant={linkVariant}>
							{address}
						</Link>
						{desc && <Text variant={variants.Text.utility4darkGray}>{desc}</Text>}
					</Stack>
				</AttributeEditWrapper>
			) : (
				<Stack spacing={4} key={id}>
					<Link external href={href} variant={linkVariant}>
						{address}
					</Link>
					{desc && <Text variant={variants.Text.utility4darkGray}>{desc}</Text>}
				</Stack>
			)

			primary ? output.unshift(item) : output.push(item)
		}
		return { output, showDirectHeading }
	}, [
		isEditMode,
		componentData,
		direct,
		locationOnly,
		orgId,
		serviceOnly,
		t,
		variants.Link.inline,
		variants.Link.inlineInverted,
		variants.Text.utility4darkGray,
	])
	if (!content.length) {
		return null
	}
	const headingContent = shouldShowDirectHeading ? t('direct.email') : t('words.email')

	return (
		<Stack spacing={12}>
			<Title order={3}>{headingContent}</Title>
			{content}
		</Stack>
	)
}

const EmailsEdit = ({ parentId = '' }: EmailsProps) => {
	const slug = useSlug()
	const apiUtils = api.useUtils()
	const { id: orgId } = useOrgInfo()
	const { t } = useTranslation(formatNs(orgId))
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
	const getTextVariant = useCallback(
		(kind: 'email' | 'desc', published: boolean, deleted: boolean) => {
			const isEmail = kind === 'email'
			if (deleted) {
				return isEmail ? variants.Text.utility3darkGrayStrikethru : variants.Text.utility4darkGrayStrikethru
			}
			if (!published) {
				return isEmail ? variants.Text.utility3darkGray : variants.Text.utility4darkGray
			}
			return isEmail ? variants.Text.utility3 : variants.Text.utility4
		},
		[
			variants.Text.utility3,
			variants.Text.utility3darkGray,
			variants.Text.utility3darkGrayStrikethru,
			variants.Text.utility4,
			variants.Text.utility4darkGray,
			variants.Text.utility4darkGrayStrikethru,
		]
	)
	const handleLinkToLocation = useCallback(
		({
			orgLocationId,
			orgEmailId,
			action,
		}: {
			orgLocationId: string
			orgEmailId: string
			action: 'link' | 'unlink'
		}) =>
			() =>
				linkToLocation.mutate({ orgLocationId, orgEmailId, action }),
		[linkToLocation]
	)
	const output = data?.map((email) => {
		const { primary: _primary, title, description, email: address, published, deleted, id } = email

		const desc = (() => {
			if (title) {
				return t(title.key, { ns: 'user-title' })
			}
			if (description?.key) {
				return t(description.key, { defaultValue: description.defaultText, ns: orgId })
			}

			return null
		})()

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
				{linkableEmails?.map(({ id, deleted, description, email, firstName, lastName, published }) => {
					const emailTextVariant = getTextVariant('email', published, deleted)
					const descTextVariant = getTextVariant('desc', published, deleted)

					return (
						<Menu.Item
							key={id}
							onClick={handleLinkToLocation({ orgLocationId: parentId, orgEmailId: id, action: 'link' })}
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
