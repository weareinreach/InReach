import { createStyles, Text, Paper } from '@mantine/core'
import { useTranslation } from 'next-i18next'

import { Icon } from '../../icon'

const useStyles = createStyles((theme) => ({
	bannerSmall: {
		width: '365px',
		display: 'flex',
		flexDirection: 'column',
		backgroundColor: theme.other.colors.primary.lightGray,
	},
	bannerLarge: {
		width: '861px',
		backgroundColor: theme.other.colors.primary.lightGray,
	},
	textSmall: {
		margin: '0 12px 12px 12px',
		fontSize: theme.fontSizes.sm,
	},
	textLarge: {
		color: 'green',
	},
	iconSmall: {
		margin: '13.25px 13.25px 9.25px 13.25px',
		color: theme.other.colors.secondary.cornflower,
		width: '17.5px',
		height: '17.5px',
	},
	iconLarge: {},
}))

export const alertTypeIcon = {
	information: 'carbon:information-filled',
	warning: 'carbon:warning-filled',
} as const

export const AlertMessage = ({ textKey, iconKey, size }: Props) => {
	const { classes } = useStyles()
	const { t } = useTranslation()
	const iconRender = alertTypeIcon[iconKey]

	return (
		<Paper className={size == 'large' ? classes.bannerLarge : classes.bannerSmall} withBorder radius='md'>
			<Icon icon={iconRender} className={size == 'large' ? classes.iconLarge : classes.iconSmall}></Icon>
			<Text className={size == 'large' ? classes.textLarge : classes.textSmall}>{t(textKey)}</Text>
		</Paper>
	)
}

type Props = {
	textKey: string
	iconKey: keyof typeof alertTypeIcon
	size: string
}
