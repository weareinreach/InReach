import { Notification } from '@mantine/core'
import { Meta, StoryObj } from '@storybook/react'
import React from 'react'

import {
	InstantFeedback,
	useStyles,
	useNewNotification,
	iconList,
	UseNotificationProps,
} from './useNewNotification'
import { Button } from '../components/core'
import { Icon } from '../icon'

/** It takes in a props object, and returns a function that shows a notification with the props */
const StoryDemo = ({ icon = 'heartFilled', displayTextKey, link }: UseNotificationProps) => {
	const showNotification = useNewNotification({ icon, displayTextKey, link })

	return (
		<>
			<Button onClick={() => showNotification()}>Click to activate notification</Button>
		</>
	)
}

const NotificationPreviewComp = ({ icon = 'heartFilled', ...others }: UseNotificationProps) => {
	const { classes } = useStyles()
	const iconStyle = { color: iconList[icon].color }
	const displayIcon = <Icon icon={iconList[icon].code} style={iconStyle} height={24} />
	return (
		<Notification
			icon={displayIcon}
			radius='lg'
			h={48}
			classNames={{ root: classes.notificationBg, icon: classes.iconBg }}
		>
			<InstantFeedback {...others} />
		</Notification>
	)
}

type Story = typeof StoryDemo

const Story: Meta<Story> = {
	title: 'Hooks/useNewNotification',
	component: StoryDemo,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=70%3A2310&t=gF8uAWa4xEOPSNAI-0',
		},
	},
	args: {
		displayTextKey: 'resource-saved',
		icon: 'heartFilled',
		link: {
			href: '#',
			textKey: 'view-list',
		},
	},
}
export default Story

export const NotificationAction: StoryObj<Story> = {
	parameters: {
		docs: {
			source: {
				code: `
const showNotification = useNewNotification({ icon, displayTextKey, link })

return (
		<Button onClick={() => showNotification()}>Click to activate notification</Button>
)
				`,
				language: 'typescript',
				type: 'auto',
				format: true,
			},
			description: {
				story: 'The hook provides a function that can be called as a result of another action',
			},
		},
	},
}

export const NotificationPreview: StoryObj<typeof StoryDemo> = {
	render: NotificationPreviewComp,
	parameters: {
		docs: {
			description: {
				story: 'Preview of displayed notification',
			},
			source: {
				code: '',
			},
		},
	},
}
