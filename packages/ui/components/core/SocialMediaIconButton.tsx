import { ActionIcon, createStyles, useMantineTheme } from '@mantine/core'

import { Icon } from '~ui/icon'

export const approvedIcons = {
	facebook: 'carbon:logo-facebook',
	instagram: 'carbon:logo-instagram',
	mail: 'carbon:email',
	youtube: 'carbon:logo-youtube',
	github: 'carbon:logo-github',
	twitter: 'carbon:logo-twitter',
	linkedin: 'carbon:logo-linkedin',
	tiktok: 'simple-icons:tiktok',
} as const

const useStyles = createStyles((theme) => ({
	button: {
		color: theme.other.colors.secondary.black,

		'&:hover': {
			backgroundColor: theme.other.colors.primary.lightGray,
		},
	},
}))

export const SocialMediaIconButton = ({ href, icon, title }: Props) => {
	const { classes } = useStyles()
	const theme = useMantineTheme()
	const iconRender = approvedIcons[icon]

	return (
		<ActionIcon component='a' href={href} target='_blank' title={title} size={32} className={classes.button}>
			<Icon icon={iconRender} color={theme.other.colors.secondary.black} height={20} />
		</ActionIcon>
	)
}

type Props = {
	href: string
	title: string
	icon: keyof typeof approvedIcons
}
