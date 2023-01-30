import { createStyles, Paper, useMantineTheme } from '@mantine/core'
import { Trans } from 'next-i18next'

import { Icon } from '../../icon'

const useStyles = createStyles((theme) => ({
	bannerSmall: {
		width: '335px',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'flex-start',
		padding: '12px',
		gap: '8px',
		backgroundColor: theme.other.colors.primary.lightGray,
	},
	bannerLarge: {
		width: '861px',
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'flex-start',
		padding: '16px',
		backgroundColor: theme.other.colors.primary.lightGray,
	},
	textSmall: {
		fontSize: theme.fontSizes.sm,
	},
	textLarge: {
		fontSize: theme.fontSizes.md,
	},
	iconSmall: {
		margin: '0 9.25px 0 0',
	},
	iconLarge: {
		minWidth: 'fit-content',
		margin: '2px 9.25px',
	},
}))

export const alertTypeIcon = {
	information: { icon: 'carbon:information-filled' },
	warning: { icon: 'carbon:warning-filled' },
} as const

export const AlertMessage = ({ textKey, iconKey, size }: Props) => {
	const { classes } = useStyles()
	const theme = useMantineTheme()
	const iconRender = alertTypeIcon[iconKey]

	return (
		<Paper className={size == 'large' ? classes.bannerLarge : classes.bannerSmall} withBorder radius='md'>
			<Icon
				icon={iconRender.icon}
				width={17.5}
				height={17.5}
				color={
					iconKey == 'information'
						? theme.other.colors.secondary.cornflower
						: theme.other.colors.tertiary.orange
				}
				className={size == 'large' ? classes.iconLarge : classes.iconSmall}
			></Icon>
			<Trans
				i18nKey={textKey}
				parent='span'
				style={size == 'large' ? { fontSize: theme.fontSizes.md } : { fontSize: theme.fontSizes.sm }}
			></Trans>
		</Paper>
	)
}

type Props = {
	textKey: string
	iconKey: keyof typeof alertTypeIcon
	size: string
}
