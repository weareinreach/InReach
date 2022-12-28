import { Icon } from '@iconify/react'

import { ActionIcon, createStyles, useMantineTheme } from '@mantine/core'

export const approvedIcons = {
	facebook: 'fe:facebook',
	instagram: 'fe:instagram',
	mail: 'fe:mail',
	youtube: 'fe:youtube',
	github: 'fe:github',
	twitter: 'fe:twitter',
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

	return (
		<ActionIcon
			component='a'
			href={href}
			target='_blank'
			title={title}
			radius={100}
			className={classes.button}
		>
			<Icon icon={icon} className={classes.icon} />
		</ActionIcon>
	)
}

type Props = {
	href: string
	title: string
	icon: typeof approvedIcons
}
