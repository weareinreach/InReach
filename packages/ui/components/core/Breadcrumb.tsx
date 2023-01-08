import { Icon } from '@iconify/react'

import { ActionIcon, Group, Text, createStyles } from '@mantine/core'

const approvedOptions = {
	close: { children: 'Close', icon: 'material-symbols:close', title: 'close' },
	back: { children: 'Back to search', icon: 'material-symbols:arrow-back', title: 'back button' },
} as const

const useStyles = createStyles((theme) => ({
	container: {
		height: '40px',
		width: 'auto',
		paddingLeft: '11px',
		paddingRight: '8px',
		paddingTop: '10px',
		paddingBottom: '10px',
		color: theme.other.colors.secondary.black,
		'&:hover': {
			backgroundColor: theme.other.colors.primary.lightGray,
		},
	},
	icon: {
		width: '20px',
		height: '20px',
	},
}))

export const Breadcrumb = ({ href, option }: Props) => {
	const { classes } = useStyles()
	const iconRender = approvedOptions[option].icon
	const childrenRender = approvedOptions[option].children
	return (
		<ActionIcon
			component='a'
			href={href}
			title={approvedOptions[option].title}
			radius={5}
			className={classes.container}
		>
			<Group position='center' spacing='xs'>
				<Icon icon={iconRender} className={classes.icon} />
				<Text size='sm'>{childrenRender}</Text>
			</Group>
		</ActionIcon>
	)
}

type Props = {
	href: string
	option: keyof typeof approvedOptions
}
