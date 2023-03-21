import { Meta, StoryObj } from '@storybook/react'

import { SocialLink, approvedIcons } from './SocialLink'

export default {
	title: 'Design System/Social Media Link',
	component: SocialLink,
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
	// render: () => (
	// 	<Group>
	// 		<SocialLink icon='facebook' href='#' title='icon' />
	// 		<SocialLink icon='github' href='#' title='icon' />
	// 		<SocialLink icon='instagram' href='#' title='icon' />
	// 		<SocialLink icon='linkedin' href='#' title='icon' />
	// 		<SocialLink icon='tiktok' href='#' title='icon' />
	// 		<SocialLink icon='twitter' href='#' title='icon' />
	// 		<SocialLink icon='youtube' href='#' title='icon' />
	// 		<SocialLink icon='mail' href='#' title='icon' />
	// 	</Group>
	// ),
} as Meta<typeof SocialLink>

type StoryDef = StoryObj<typeof SocialLink>
type StoryGroupDef = StoryObj<typeof SocialLink.Group>

export const Button = {
	args: { icon: 'facebook', href: '#', title: 'icon' },
} satisfies StoryDef
export const Group = {
	args: {
		links: [
			{ icon: 'facebook', href: '#', title: 'icon' },
			{ icon: 'github', href: '#', title: 'icon' },
			{ icon: 'instagram', href: '#', title: 'icon' },
			{ icon: 'linkedin', href: '#', title: 'icon' },
			{ icon: 'tiktok', href: '#', title: 'icon' },
			{ icon: 'twitter', href: '#', title: 'icon' },
			{ icon: 'youtube', href: '#', title: 'icon' },
			{ icon: 'mail', href: '#', title: 'icon' },
		],
		header: true,
	},
	render: (args) => <SocialLink.Group {...args} />,
} satisfies StoryGroupDef
