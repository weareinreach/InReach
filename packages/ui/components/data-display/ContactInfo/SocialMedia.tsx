import { Group, List, Menu, Stack, Text, Title, useMantineTheme } from '@mantine/core'
import { useTranslation } from 'next-i18next'
import { useCallback } from 'react'

import { isIdFor } from '@weareinreach/db/lib/idGen'
import { Link } from '~ui/components/core/Link'
import { isSocialIcon, SocialLink, type SocialLinkProps } from '~ui/components/core/SocialLink'
import { SocialMediaDrawer } from '~ui/components/data-portal/SocialMediaDrawer'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { useSlug } from '~ui/hooks/useSlug'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { useCommonStyles } from './common.styles'
import { type SocialMediaProps } from './types'

export const SocialMedia = ({ edit, ...props }: SocialMediaProps) =>
	edit ? <SocialMediaEdit {...props} /> : <SocialMediaDisplay {...props} />

const SocialMediaDisplay = ({ parentId = '', passedData, locationOnly }: SocialMediaProps) => {
	const { data } = api.orgSocialMedia.forContactInfo.useQuery(
		{ parentId, locationOnly },
		{ enabled: !passedData }
	)

	const componentData = passedData ?? data

	if (!componentData?.length) {
		return null
	}
	const items: SocialLinkProps[] = []

	for (const item of componentData) {
		const icon = item.service.toLowerCase()
		if (!isSocialIcon(icon)) {
			continue
		}
		items.push({
			icon,
			href: item.url,
			title: item.username,
		})
	}
	if (!items.length) {
		return null
	}
	return <SocialLink.Group links={items} header />
}

const SocialMediaEdit = ({ parentId = '' }: SocialMediaProps) => {
	const apiUtils = api.useUtils()
	const slug = useSlug()
	const { data } = api.orgSocialMedia.forContactInfoEdits.useQuery({ parentId })
	const { t } = useTranslation(['common'])
	const { classes } = useCommonStyles()
	const variants = useCustomVariant()
	const theme = useMantineTheme()
	const isLocation = isIdFor('orgLocation', parentId)
	const { data: linkableSocials } = api.orgSocialMedia.getLinkOptions.useQuery(
		{ slug, locationId: parentId },
		{
			enabled: isLocation,
		}
	)
	const linkToLocation = api.orgSocialMedia.locationLink.useMutation({
		onSuccess: () => apiUtils.orgSocialMedia.invalidate(),
	})
	const getTextVariants = useCallback(
		({ published, deleted }: { published: boolean; deleted: boolean }) => {
			if (deleted) {
				return {
					social: variants.Text.utility3darkGrayStrikethru,
					desc: variants.Text.utility4darkGrayStrikethru,
				}
			}
			if (!published) {
				return {
					social: variants.Text.utility3darkGray,
					desc: variants.Text.utility4darkGray,
				}
			}

			return {
				social: variants.Text.utility3,
				desc: variants.Text.utility4,
			}
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
		({ orgLocationId, orgSocialMediaId }: { orgLocationId: string; orgSocialMediaId: string }) =>
			() =>
				linkToLocation.mutate({ orgLocationId, orgSocialMediaId, action: 'link' }),
		[linkToLocation]
	)

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
				{linkableSocials?.map(({ id, deleted, service, published, url }) => {
					const { social: socialTextVariant, desc: descTextVariant } = getTextVariants({ published, deleted })
					return (
						<Menu.Item
							key={id}
							onClick={handleLinkToLocation({ orgLocationId: parentId, orgSocialMediaId: id })}
						>
							<Group noWrap>
								<Icon icon='carbon:link' />
								<Stack spacing={0}>
									<Group noWrap spacing={8}>
										<Icon icon={service.logoIcon} />
										<Text variant={socialTextVariant}>{service.name}</Text>
									</Group>

									<Text variant={descTextVariant}>{url}</Text>
								</Stack>
							</Group>
						</Menu.Item>
					)
				})}
				<Menu.Divider />
				<Menu.Item key='new'>
					<SocialMediaDrawer
						key='new'
						component={Link}
						external
						variant={variants.Link.inlineInverted}
						createNew
					>
						<Group noWrap>
							<Icon icon='carbon:add-alt' />
							<Text variant={variants.Text.utility3}>Create new</Text>
						</Group>
					</SocialMediaDrawer>
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	) : (
		<SocialMediaDrawer key='new' component={Link} external variant={variants.Link.inlineInverted} createNew>
			<Group noWrap>
				<Icon icon='carbon:add' />
				<Text variant={variants.Text.utility3}>Create new</Text>
			</Group>
		</SocialMediaDrawer>
	)

	return (
		<Stack spacing={12}>
			<Title order={3}>{t('social.group-header')}</Title>
			<Stack spacing={12} className={classes.overlay}>
				<List listStyleType='none'>
					{data?.map((link) => {
						const renderItem = () => {
							switch (true) {
								case link.deleted: {
									return (
										<Group noWrap spacing={8}>
											<Icon icon={link.serviceIcon} color={theme.other.colors.secondary.darkGray} />
											<Text variant={variants.Text.darkGrayStrikethru}>{link.service}</Text>
											<Text variant={variants.Text.utility4darkGrayStrikethru}>({link.username})</Text>
										</Group>
									)
								}
								case !link.published: {
									return (
										<Group noWrap spacing={12}>
											<Icon
												icon='carbon:view-off'
												color={theme.other.colors.secondary.darkGray}
												height={24}
											/>
											<Group noWrap spacing={8}>
												<Icon icon={link.serviceIcon} color={theme.other.colors.secondary.darkGray} />
												<Text variant={variants.Text.darkGray}>{link.service}</Text>
												<Text variant={variants.Text.utility4darkGray}>({link.username})</Text>
											</Group>
										</Group>
									)
								}
								default: {
									return (
										<Group noWrap spacing={8}>
											<Icon icon={link.serviceIcon} />
											<Text>{link.service}</Text>
											<Text variant={variants.Text.utility4}>({link.username})</Text>
										</Group>
									)
								}
							}
						}

						return (
							<List.Item key={link.id}>
								<SocialMediaDrawer
									component={Link}
									external
									id={link.id}
									variant={variants.Link.inlineInverted}
								>
									{renderItem()}
								</SocialMediaDrawer>
							</List.Item>
						)
					})}
					<List.Item>{addOrLink}</List.Item>
				</List>
			</Stack>
		</Stack>
	)
}
