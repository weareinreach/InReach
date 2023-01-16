import { Avatar, Badge, Text, Tooltip, createStyles } from '@mantine/core'

const useStyles = createStyles((theme) => ({
	ellipse: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		alignSelf: 'center',
		marginLeft: '5px',
	},
	badge: {
		paddingLeft: 0,
		borderStyle: 'hidden',
	},
	avatar: {},
	emoji: {
		position: 'absolute',
		fontWeight: 500,
	},
	text: {
		color: 'black',
	},
}))

export const BadgeComponent = ({ color, emoji, key_value, minify }: BadgeProps) => {
	const { classes } = useStyles()

	// Two api calls to retrieve
	// const key_translated = key;
	// const key_translated_label = key;
	const ellipse = (
		<Text size={4} className={classes.ellipse}>
			{'\u2B24'}
		</Text>
	)
	const emoji_avatar = (
		<Avatar size={24} color={color} radius={100} className={classes.avatar} variant='filled'>
			<Text className={classes.emoji}>{emoji}</Text>
		</Avatar>
	)

	return (
		<Tooltip label={key_value}>
			<Badge variant='outline' radius={100} size='xl' className={classes.badge} leftSection={emoji_avatar}>
				<Text fw={500} className={classes.text} sx={{ display: minify ? 'none' : 'hidden' }}>
					{key_value} {ellipse}
				</Text>
			</Badge>
		</Tooltip>
	)
}

export type BadgeProps = {
	color: string
	emoji: string
	key_value: string
	minify: boolean
}
