import { createStyles, Paper, useMantineTheme } from '@mantine/core'
import { Trans } from 'next-i18next'

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
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'flex-start',
		padding: '16px',
		backgroundColor: theme.other.colors.primary.lightGray,
	},
	textSmall: {
		margin: '0 12px 12px 12px',
		fontSize: theme.fontSizes.sm,
	},
	textLarge: {
		fontSize: theme.fontSizes.md,
	},
	iconSmall: {
		margin: '13.25px 13.25px 9.25px 13.25px',
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
				className={size == 'large' ? classes.textLarge : classes.textSmall}
				i18nKey={textKey}
				components={{ b: <strong /> }}
			>
				{/* {t(textKey)} */}
			</Trans>
		</Paper>
	)
}

type Props = {
	textKey: string
	iconKey: keyof typeof alertTypeIcon
	size: string
}
