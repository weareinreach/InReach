import { createStyles, Group, Text, useMantineTheme } from '@mantine/core'
import { type NotificationProps, showNotification } from '@mantine/notifications'
import { type DefaultTFuncReturn } from 'i18next'
import Link, { type LinkProps } from 'next/link'

import { Icon } from '~ui/icon'
import { commonTheme } from '~ui/theme/common'

export const useStyles = createStyles((theme) => ({
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

export const iconList = {
	heartFilled: { code: 'carbon:favorite-filled', color: undefined },
	heartEmpty: { code: 'carbon:favorite', color: undefined },
	info: { code: 'carbon:information-filled', color: commonTheme.other?.colors.secondary.cornflower },
	warning: { code: 'carbon:warning-filled', color: commonTheme.other?.colors.tertiary.red },
	added: { code: 'carbon:add-filled', color: undefined },
	deleted: { code: 'carbon:delete', color: undefined },
} as const

export const InstantFeedback = ({ displayText, link }: NotificationInnerProps) => {
	const theme = useMantineTheme()

	return (
		<Group position='apart' spacing='lg'>
			<Text color={theme.other.colors.secondary.white} fw={theme.other.fontWeight.semibold}>
				{displayText}
			</Text>
			{link && (
				<Text
					component={Link}
					href={link.href}
					style={{ color: theme.other.colors.tertiary.lightBlue }}
					fw={theme.other.fontWeight.semibold}
				>
					{link.text}
				</Text>
			)}
		</Group>
	)
}

/**
 * It takes in a props object, and returns a function that shows a notification with the props
 *
 * @example Usage:
 *
 * ```ts
 * const showNotification = useNewNotification({ icon, displayTextKey, link })
 * return <Button onClick={() => showNotification()}>Click to activate notification</Button>
 * ```
 *
 * @returns A function that shows a notification
 */
export const useNewNotification = ({ icon, ...others }: UseNotificationProps) => {
	const { classes } = useStyles()
	const iconStyle = { color: iconList[icon].color }

	const displayIcon = <Icon icon={iconList[icon].code} style={iconStyle} height={24} />

	const notificationProps: NotificationProps = {
		message: <InstantFeedback {...others} />,
		icon: displayIcon,
		radius: 'lg',
		h: 48,
		classNames: { root: classes.notificationBg, icon: classes.iconBg },
	}
	return () => showNotification(notificationProps)
}

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type NotificationInnerProps = Optional<UseNotificationProps, 'icon'>

export type UseNotificationProps = {
	/** Text to display */
	displayText: string | DefaultTFuncReturn
	/** Display icon */
	icon: keyof typeof iconList
	/**
	 * @param href - URL
	 * @param text - Text to display
	 */
	link?: {
		/** URL */
		href: LinkProps['href']
		/** Text to display */
		text: string | DefaultTFuncReturn
	}
}
