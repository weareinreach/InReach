import { Icon } from '@iconify/react'
import { ActionIcon, createStyles } from '@mantine/core'

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
		height: '32px',
		width: '32px',
		'&:hover': {
			backgroundColor: theme.other.colors.primary.lightGray,
		},
	},
	icon: {
		width: '75%',
		height: '75%',
	},
}))

export const SocialMediaIconButton = ({ href, icon, title }: Props) => {
	const { classes } = useStyles()
	const iconRender = approvedIcons[icon]
	return (
		<ActionIcon
			component='a'
			href={href}
			target='_blank'
			title={title}
			radius={100}
			className={classes.button}
		>
			<Icon icon={iconRender} className={classes.icon} />
		</ActionIcon>
	)
}

type Props = {
	href: string
	title: string
	icon: keyof typeof approvedIcons
}
