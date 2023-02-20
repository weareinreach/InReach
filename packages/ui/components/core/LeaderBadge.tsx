import { Text, Tooltip, createStyles, useMantineTheme, Box, ColorSwatch } from '@mantine/core'
import { useTranslation } from 'react-i18next'

import { Badge } from './Badge'

const useStyles = createStyles((theme, params: Pick<LeaderBadgeProps, 'color'>) => ({
	avatar: {
		fontSize: theme.fontSizes.xs,
		// backgroundColor: params.color,
		borderRadius: theme.radius.xl,
		height: 24,
		width: 24,
		margin: 0,
	},
	leftSection: {
		margin: 0,
	},
	text: {
		color: theme.other.colors.secondary.black,
		marginLeft: theme.spacing.xs,
	},
}))

export const LeaderBadge = ({
	color,
	emoji,
	key_value,
	minify = false,
	hideBg = false,
}: LeaderBadgeProps) => {
	const { classes } = useStyles({ color })
	const { t } = useTranslation('attribute')
	const theme = useMantineTheme()
	const label = t(key_value)
	const tooltip = t(`${key_value}-org`)

	const miniStyle = minify
		? {
				height: 40,
				width: 40,
				['&:hover']: {
					backgroundColor: theme.other.colors.primary.lightGray,
				},
				radius: theme.radius.xl,
				padding: 0,
		  }
		: {}
	const miniGroupStyle = hideBg
		? {
				backgroundColor: undefined,
				height: undefined,
				width: undefined,
				paddingLeft: 6,
				paddingRight: 6,
		  }
		: {}

	return (
		<Tooltip label={tooltip} disabled={!minify}>
			<Badge
				variant='outline'
				size='xl'
				classNames={{ leftSection: classes.leftSection }}
				sx={{ border: 0, padding: 0, ...miniStyle, ...miniGroupStyle }}
				leftSection={
					<ColorSwatch color={color} className={classes.avatar} radius={24} size={24}>
						<span>{emoji}</span>
					</ColorSwatch>
				}
			>
				<Text fw={500} className={classes.text} sx={{ display: minify ? 'none' : 'hidden' }}>
					{label}
				</Text>
			</Badge>
		</Tooltip>
	)
}

export type LeaderBadgeProps = {
	/** Background color for icon */
	color: string
	/** Unicode emoji string */
	emoji: string
	/** I18n translation key */
	key_value: string
	/** Show icon only? */
	minify?: boolean
	/** Hide light gray bg for mini */
	hideBg?: boolean
}
