import { createStyles, Paper, Text, useMantineTheme } from '@mantine/core'
import { Trans } from 'next-i18next'
import { type LiteralUnion } from 'type-fest'

import { Icon, type IconList } from '~ui/icon'

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

type MapKeys = LiteralUnion<
	'information' | 'warning' | 'carbon:information-filled' | 'carbon:warning-filled',
	string
>

const iconMap = new Map<MapKeys, IconList>([
	['information', 'carbon:information-filled'],
	['warning', 'carbon:warning-filled'],
	['carbon:information-filled', 'carbon:information-filled'],
	['carbon:warning-filled', 'carbon:warning-filled'],
])

/** Used to display an alert message on an organization/location/service. */
export const AlertMessage = ({ textKey, ns, iconKey = 'information', defaultText }: Props) => {
	const { classes } = useStyles()
	const theme = useMantineTheme()
	const iconDef = iconKey ?? 'information'
	const iconRender = iconMap.get(iconDef) ?? 'carbon:information-filled'

	return (
		<Paper radius='md' className={classes.messageContainer}>
			<Icon
				icon={iconRender}
				width={20}
				height={20}
				color={
					['information', 'carbon:information-filled'].includes(iconDef)
						? theme.other.colors.secondary.cornflower
						: theme.other.colors.tertiary.orange
				}
				className={classes.iconContainer}
			/>
			<Trans
				i18nKey={textKey}
				ns={ns}
				parent={Text}
				className={classes.textContainer}
				defaults={defaultText}
			/>
		</Paper>
	)
}

type Props = {
	/** The alert message is created using a textKey from the i18n JSON/Crowdin */
	textKey: string
	ns?: string
	defaultText?: string
	/** `warning` or `information` will dictate the icon that is displayed with the alert */
	iconKey: MapKeys | null
}
