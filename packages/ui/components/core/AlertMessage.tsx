import { createStyles, Paper, useMantineTheme } from '@mantine/core'
import { Trans } from 'next-i18next'

import { Icon } from '../../icon'

const useStyles = createStyles((theme) => ({
	messageContainerSmall: {
		maxWidth: '335px',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'flex-start',
		padding: theme.spacing.sm,
		gap: theme.spacing.xs - 2,
		backgroundColor: theme.other.colors.primary.lightGray,
	},
	messageContainerLarge: {
		maxWidth: '861px',
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'flex-start',
		padding: theme.spacing.md,
		backgroundColor: theme.other.colors.primary.lightGray,
	},
	iconContainerLarge: {
		minWidth: 'fit-content',
		marginTop: theme.spacing.xs - 8,
		marginRight: theme.spacing.xs - 0.75,
	},
	textContainerSmall: {
		fontSize: theme.fontSizes.sm,
	},
	textContainerLarge: {
		fontSize: theme.fontSizes.md,
	},
}))

export const alertTypeIcon = {
	information: { icon: 'carbon:information-filled' },
	warning: { icon: 'carbon:warning-filled' },
} as const

/** Used to display an alert message on an organization/location/service. */
export const AlertMessage = ({ textKey, iconKey = 'information', size = 'lg' }: Props) => {
	const { classes } = useStyles()
	const theme = useMantineTheme()
	const iconRender = alertTypeIcon[iconKey]

	return (
		<Paper
			withBorder
			radius='md'
			className={size == 'lg' ? classes.messageContainerLarge : classes.messageContainerSmall}
		>
			<Icon
				icon={iconRender.icon}
				width={17.5}
				height={17.5}
				color={
					iconKey == 'information'
						? theme.other.colors.secondary.cornflower
						: theme.other.colors.tertiary.orange
				}
				className={size == 'lg' ? classes.iconContainerLarge : ''}
			></Icon>
			<Trans
				i18nKey={textKey}
				parent='p'
				className={size == 'lg' ? classes.textContainerLarge : classes.textContainerSmall}
			></Trans>
		</Paper>
	)
}

type Props = {
	/** The alert message is created using a textKey from the i18n JSON/Crowdin */
	textKey: string
	/** `warning` or `information` will dictate the icon that is displayed with the alert */
	iconKey: keyof typeof alertTypeIcon
	/** Size of the alert box */
	size: 'sm' | 'lg'
}
