import { Group, List, Stack, Text, Title, useMantineTheme } from '@mantine/core'
import { useTranslation } from 'next-i18next'

import { Link } from '~ui/components/core/Link'
import { isSocialIcon, SocialLink, type SocialLinkProps } from '~ui/components/core/SocialLink'
import { SocialMediaDrawer } from '~ui/components/data-portal/SocialMediaDrawer'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
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

const SocialMediaEdit = ({ parentId = '' }: SocialMediaProps) => {
	const { data } = api.orgSocialMedia.forContactInfoEdits.useQuery({ parentId })
	const { t } = useTranslation(['common'])
	const { classes } = useCommonStyles()
	const variants = useCustomVariant()
	const theme = useMantineTheme()

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
											</Group>
										</Group>
									)
								}
								default: {
									return (
										<Group noWrap spacing={8}>
											<Icon icon={link.serviceIcon} />
											<Text>{link.service}</Text>
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
					<List.Item>
						<SocialMediaDrawer
							key='new'
							component={Link}
							external
							variant={variants.Link.inlineInverted}
							createNew
						>
							<Group noWrap spacing={8}>
								<Text variant={variants.Text.utility3}>➕ Create new</Text>
							</Group>
						</SocialMediaDrawer>
					</List.Item>
				</List>
			</Stack>
		</Stack>
	)
}
