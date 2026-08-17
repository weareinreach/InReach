import { ActionIcon, createStyles, Group, Stack, Title, useMantineTheme } from '@mantine/core'
import { useTranslation } from 'next-i18next/pages'
import { useCallback } from 'react'

import { productEvent } from '@weareinreach/analytics/events'
import { Icon } from '~ui/icon'

export const socialMediaIcons = {
	facebook: 'carbon:logo-facebook',
	instagram: 'carbon:logo-instagram',
	email: 'carbon:email',
	youtube: 'carbon:logo-youtube',
	github: 'carbon:logo-github',
	linkedin: 'carbon:logo-linkedin',
	tiktok: 'simple-icons:tiktok',
} as const

type SocialMediaIcon = keyof typeof socialMediaIcons
export const isSocialIcon = (icon: string): icon is SocialMediaIcon =>
	Object.keys(socialMediaIcons).includes(icon)

const useStyles = createStyles((theme) => ({
	button: {
		color: theme.other.colors.secondary.black,

		'&:hover': {
			backgroundColor: theme.other.colors.primary.lightGray,
		},
	},
}))

export const SocialLink = ({ href, icon, title, itemName }: SocialLinkProps) => {
	const { classes } = useStyles()
	const theme = useMantineTheme()
	const iconRender = socialMediaIcons[icon]
	const { t } = useTranslation(['common'])

	const onClick = useCallback(() => {
		productEvent.outboundClick('social', href, itemName ?? 'unknown')
	}, [href, itemName])

	return (
		<ActionIcon
			component='a'
			href={href}
			target='_blank'
			title={title ?? t(`social.${icon}`)}
			size={32}
			className={classes.button}
			onClick={onClick}
		>
			<Icon icon={iconRender} color={theme.other.colors.secondary.black} height={20} />
		</ActionIcon>
	)
}

const SocialGroup = ({ links, header, itemName }: GroupProps) => {
	const { t } = useTranslation(['common'])
	return (
		<Stack spacing={12}>
			{header && <Title order={3}>{t('social.group-header')}</Title>}
			<Group spacing={12} noWrap>
				{links.map((link, i) => (
					<SocialLink key={`${i}${link.title ?? link.icon}`} {...link} itemName={itemName} />
				))}
			</Group>
		</Stack>
	)
}
SocialLink.Group = SocialGroup
type GroupProps = {
	links: SocialLinkProps[]
	header?: boolean
	itemName?: string
}

export type SocialLinkProps = {
	href: string
	/** Override `aria-label`. Defaults to service name. */
	title?: string
	icon: SocialMediaIcon
	itemName?: string
}
