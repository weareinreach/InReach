import { Icon } from '@iconify/react'

import { ActionIcon, createStyles } from '@mantine/core'

const approvedIcons = {
	facebook: 'fa6-brands:facebook-f',
	instagram: 'fa6-brands:instagram',
	mail: 'fa6-solid:envelope',
	youtube: 'fa6-brands:youtube',
	github: 'fa6-brands:github',
	twitter: 'fa6-brands:twitter',
	linkedin: 'fa6-brands:linkedin-in',
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
