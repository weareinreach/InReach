import { Icon } from '@iconify/react'
import { Avatar, Tooltip, Text, Group, createStyles, Badge } from '@mantine/core'

const useStyles = createStyles((theme) => ({
	avatar: {},
	badge: {
		paddingLeft: 0,
		paddingRight: 0,
		borderStyle: 'hidden',
	},
	icon: {
		color: 'white',
		position: 'absolute',
		fontWeight: 500,
		height: '17.5px',
		width: '17.5px',
	},
	text: {
		width: 'auto',
		fontSize: '16px',
		lineHeight: '20px',
		fontWeight: 500,
		color: 'black',
		marginLeft: '9.25px',
	},
	tooltip: {},
}))

export const VerifiedBadge = ({ text, tooltip_text }: Props) => {
	const { classes } = useStyles()

	const verified_avatar = (
		<Avatar size={24} radius={100} className={classes.avatar} color='green' variant='filled'>
			<Icon icon='material-symbols:check' className={classes.icon} />
		</Avatar>
	)

	return (
		<Tooltip label={tooltip_text} position='bottom-start' multiline width={600} offset={10}>
			<Badge variant='outline' radius={100} size='xl' className={classes.badge} leftSection={verified_avatar}>
				<Text className={classes.text}>{text}</Text>
			</Badge>
		</Tooltip>
	)
}

type Props = {
	text: string
	tooltip_text: string
}
