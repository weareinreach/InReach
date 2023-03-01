import { Group } from '@mantine/core'
import { Meta } from '@storybook/react'

import { SocialMediaIconButton, approvedIcons } from './SocialMediaIconButton'

export default {
	title: 'Design System/Social Media Button',
	component: SocialMediaIconButton,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=338%3A6951&t=sleVeGl2lJv7Df18-4',
		},
	},
	argTypes: {
		icon: {
			options: Object.keys(approvedIcons),
			type: 'string',
		},
	},
	render: () => (
		<Group>
			<SocialMediaIconButton icon='facebook' href='#' title='icon' />
			<SocialMediaIconButton icon='github' href='#' title='icon' />
			<SocialMediaIconButton icon='instagram' href='#' title='icon' />
			<SocialMediaIconButton icon='linkedin' href='#' title='icon' />
			<SocialMediaIconButton icon='tiktok' href='#' title='icon' />
			<SocialMediaIconButton icon='twitter' href='#' title='icon' />
			<SocialMediaIconButton icon='youtube' href='#' title='icon' />
			<SocialMediaIconButton icon='mail' href='#' title='icon' />
		</Group>
	),
} as Meta<typeof SocialMediaIconButton>

export const SocialMediaButtons = {}
