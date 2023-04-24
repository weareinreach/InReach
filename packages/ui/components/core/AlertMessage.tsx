import { createStyles, Paper, useMantineTheme } from '@mantine/core'
import { Trans } from 'next-i18next'

import { Icon } from '~ui/icon'

const useStyles = createStyles((theme) => ({
	messageContainer: {
		display: 'flex',
		alignItems: 'flex-start',
		backgroundColor: theme.other.colors.primary.lightGray,
		flexDirection: 'column',
		padding: theme.spacing.sm,
		gap: theme.spacing.xs,
		[theme.fn.largerThan('sm')]: {
			flexDirection: 'row',
			padding: theme.spacing.md,
			gap: 'unset',
		},
	},
	iconContainer: {
		[theme.fn.largerThan('sm')]: {
			minWidth: 'fit-content',
			// marginTop: 2,
			marginRight: theme.spacing.xs,
		},
	},
	textContainer: {
		fontSize: theme.fontSizes.sm,
		[theme.fn.largerThan('sm')]: {
			fontSize: theme.fontSizes.md,
		},
	},
}))

export const alertTypeIcon = {
	information: { icon: 'carbon:information-filled' },
	warning: { icon: 'carbon:warning-filled' },
	'carbon:information-filled': { icon: 'carbon:information-filled' },
	'carbon:warning-filled': { icon: 'carbon:warning-filled' },
} as const

/** Used to display an alert message on an organization/location/service. */
export const AlertMessage = ({ textKey, iconKey = 'information' }: Props) => {
	const { classes } = useStyles()
	const theme = useMantineTheme()
	const iconRender = alertTypeIcon[iconKey]

	return (
		<Paper radius='md' className={classes.messageContainer}>
			<Icon
				icon={iconRender.icon}
				width={20}
				height={20}
				color={
					iconKey == 'information'
						? theme.other.colors.secondary.cornflower
						: theme.other.colors.tertiary.orange
				}
				className={classes.iconContainer}
			></Icon>
			<Trans i18nKey={textKey} parent='p' className={classes.textContainer}></Trans>
		</Paper>
	)
}

type Props = {
	/** The alert message is created using a textKey from the i18n JSON/Crowdin */
	textKey: string
	/** `warning` or `information` will dictate the icon that is displayed with the alert */
	iconKey: keyof typeof alertTypeIcon
}
