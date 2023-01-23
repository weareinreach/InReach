import { Group, Notification, Text, createStyles, useMantineTheme } from '@mantine/core'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'

import { Icon } from '../../icon'
import { commonTheme } from '../../theme/common'

const useStyles = createStyles((theme) => ({
	icon: {
		height: '18.75px',
		width: '21.07px',
	},
	notification: {
		backgroundColor: '#2C2E33',
		width: '335px',
		height: '48px',
	},
	resourceText: {
		color: 'white',
		fontSize: '16px',
		fontWeight: theme.other.fontWeight.semibold,
	},
	viewList: {
		color: '#79ADD7',
		fontSize: '16px',
		fontWeight: theme.other.fontWeight.semibold,
	},
}))

const iconList = {
	heartFilled: { code: 'carbon:favorite-filled', color: undefined },
	heartEmpty: { code: 'carbon:favorite', color: undefined },
	info: { code: 'carbon:information-filled', color: commonTheme.other?.colors.secondary.cornflower },
	warning: { code: 'carbon:warning-filled', color: commonTheme.other?.colors.tertiary.red },
} as const

export const InstantFeedback = ({ displayTextKey, icon, link }: Props) => {
	const { classes } = useStyles()
	const { t } = useTranslation()

	const iconStyle = iconList[icon].color ? { color: iconList[icon].color } : undefined

	const displayIcon = <Icon icon={iconList[icon].code} style={iconStyle} className={classes.icon} />

	return (
		<Notification icon={displayIcon} color='dark' radius='lg' className={classes.notification}>
			<Group position='apart' spacing='lg'>
				<Text className={classes.resourceText}>{t(displayTextKey)}</Text>
				<Text component={Link} href={link.href} className={classes.viewList}>
					{t(link.textKey)}
				</Text>
			</Group>
		</Notification>
	)
}

type Props = {
	/** I18Next translation key */
	displayTextKey: string
	/** Display icon */
	icon: keyof typeof iconList
	/**
	 * @param href - URL
	 * @param textKey - I18Next translation key
	 */
	link: {
		/** URL */
		href: string
		/** I18Next translation key */
		textKey: string
	}
}
