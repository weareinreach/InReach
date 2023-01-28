import { Group, Notification, Text, createStyles, useMantineTheme } from '@mantine/core'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'

import { Icon } from '../../icon'
import { commonTheme } from '../../theme/common'

const useStyles = createStyles((theme) => ({
	notificationBg: {
		backgroundColor: theme.other.colors.secondary.black,
	},
	iconBg: {
		background: `${theme.other.colors.secondary.black} !important`,
	},
	link: {
		color: theme.other.colors.tertiary.lightBlue,
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
	const theme = useMantineTheme()
	const iconStyle = { color: iconList[icon].color }

	const displayIcon = <Icon icon={iconList[icon].code} style={iconStyle} height={24} />

	return (
		<Notification
			icon={displayIcon}
			radius='lg'
			// color='dark'
			h={48}
			classNames={{ root: classes.notificationBg, icon: classes.iconBg }}
		>
			<Group position='apart' spacing='lg'>
				<Text color={theme.other.colors.secondary.white} fw={theme.other.fontWeight.semibold}>
					{t(displayTextKey)}
				</Text>
				<Text
					component={Link}
					href={link.href}
					style={{ color: theme.other.colors.tertiary.lightBlue }}
					fw={theme.other.fontWeight.semibold}
				>
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
