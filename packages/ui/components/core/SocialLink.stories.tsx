import { Meta, StoryObj } from '@storybook/react'

import { SocialLink, socialMediaIcons } from './SocialLink'

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
			options: Object.keys(socialMediaIcons),
			type: 'string',
		},
	},
} as Meta<typeof SocialLink>

type StoryDef = StoryObj<typeof SocialLink>
type StoryGroupDef = StoryObj<typeof SocialLink.Group>

export const Button = {
	args: { icon: 'facebook', href: '#' },
} satisfies StoryDef
export const Group = {
	args: {
		links: [
			{ icon: 'facebook', href: '#' },
			{ icon: 'github', href: '#' },
			{ icon: 'instagram', href: '#' },
			{ icon: 'linkedin', href: '#' },
			{ icon: 'tiktok', href: '#' },
			{ icon: 'twitter', href: '#' },
			{ icon: 'youtube', href: '#' },
			{ icon: 'email', href: '#' },
		],
		header: true,
	},
	render: (args) => <SocialLink.Group {...args} />,
} satisfies StoryGroupDef
