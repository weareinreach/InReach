import { type Meta, type StoryObj } from '@storybook/react'

import { commonTheme as theme } from '~ui/theme/common'

import { Badge } from './index'

const accessToken = process.env.STORYBOOK_FIGMA_ACCESS_TOKEN as string
const figmaSpec = (url: `https://${string}`) => ({
	type: 'figspec' as const,
	url,
	accessToken: process.env.STORYBOOK_FIGMA_ACCESS_TOKEN as string,
})
export default {
	title: 'Design System/Tags and Badges',
	component: Badge,
	parameters: {
		design: figmaSpec(
			'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=234%3A8505&t=sleVeGl2lJv7Df18-4'
		),
	},
} satisfies Meta<typeof Badge>
type StoryDef = StoryObj<typeof Badge>
type GroupStory = StoryObj<typeof Badge.Group>

const groupParams = {
	argTypes: {
		withSeparator: {
			control: 'boolean',
		},
	},
	parameters: {
		controls: {
			include: ['badges', 'withSeparator'],
		},
	},
	render: (args) => <Badge.Group {...args} />,
} satisfies GroupStory

export const Attribute = {
	args: {
		icon: 'carbon:piggy-bank',
		children: 'Attribute Text',
	},
	argTypes: {
		icon: {
			options: ['carbon:piggy-bank', 'carbon:globe', 'carbon:accessibility', 'carbon:warning'],
			control: 'select',
		},
	},
	parameters: {
		controls: {
			include: ['icon'],
		},
		design: figmaSpec(
			'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?type=design&node-id=1566-7269&mode=design&t=P7ERsleiTj8PoFXM-4'
		),
	},
	render: (args) => <Badge.Attribute {...args} />,
} satisfies StoryObj<typeof Badge.Attribute>

export const Community = {
	args: {
		icon: '✊🏿',
		children: 'BIPOC Community',
	},
	parameters: {
		design: figmaSpec(
			'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?type=design&node-id=234-8506&mode=design&t=P7ERsleiTj8PoFXM-4'
		),
		controls: {
			include: ['icon'],
		},
	},
	render: (args) => <Badge.Community {...args} />,
} satisfies StoryObj<typeof Badge.Community>

export const CommunityGroup = {
	args: {
		children: [
			<Badge.Community key='1' icon='✊🏿'>
				BIPOC Community
			</Badge.Community>,
			<Badge.Community key='2' icon='💛'>
				HIV Community
			</Badge.Community>,
			<Badge.Community key='3' icon='🗣'>
				Spanish Speakers
			</Badge.Community>,
		],
		withSeparator: true,
	},
	parameters: {
		controls: {
			include: ['children', 'withSeparator'],
		},
		design: figmaSpec(
			'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?type=design&node-id=337-7074&mode=design&t=P7ERsleiTj8PoFXM-4'
		),
	},
	render: (args) => <Badge.Group {...args} />,
} satisfies StoryObj<typeof Badge.Group>

export const Leader = {
	args: {
		iconBg: theme.other.colors.tertiary.lightBlue,
		icon: '️‍️‍🌎',
		minify: false,
		children: 'Immigrant-led',
	},
	argTypes: {
		hideBg: {
			control: {
				type: 'boolean',
				if: {
					arg: 'minify',
				},
			},
		},
	},
	parameters: {
		controls: {
			include: ['color', 'icon', 'children', 'minify', 'hideBg'],
		},
		design: figmaSpec(
			'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?type=design&node-id=337-7072&mode=design&t=P7ERsleiTj8PoFXM-4'
		),
	},
	render: (args) => <Badge.Leader {...args} />,
} satisfies StoryObj<typeof Badge.Leader>

export const LeaderMini = {
	args: {
		iconBg: theme.other.colors.tertiary.orange,
		icon: '️‍️‍✊🏿',
		children: 'Black-led',
		minify: true,
	},
	argTypes: {
		hideBg: {
			control: {
				type: 'boolean',
				if: {
					arg: 'minify',
				},
			},
		},
	},
	parameters: {
		controls: {
			include: ['color', 'icon', 'children', 'minify', 'hideBg'],
		},
	},
	render: (args) => <Badge.Leader {...args} />,
} satisfies StoryObj<typeof Badge.Leader>

export const Service = {
	args: {
		children: 'Abortion Care',
	},
	parameters: {
		design: figmaSpec(
			'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=234%3A8508&t=sleVeGl2lJv7Df18-4'
		),
		controls: {
			include: ['tsKey', 'variant'],
		},
	},
	render: (args) => <Badge.Service {...args} />,
} satisfies StoryObj<typeof Badge.Service>

export const ServiceGroup = {
	args: {
		children: [
			<Badge.Service key='1'>Abortion Care</Badge.Service>,
			<Badge.Service key='2'>Education and Employment</Badge.Service>,
			<Badge.Service key='3'>Food</Badge.Service>,
		],
		withSeparator: false,
	},
	parameters: {
		controls: {
			include: ['children', 'withSeparator'],
		},
	},
	render: (args) => <Badge.Group {...args} />,
} satisfies StoryObj<typeof Badge.Group>

export const Verified = {
	args: {
		lastverified: new Date(2023, 1, 15),
	},
	parameters: {
		controls: {
			include: ['lastverified'],
		},
	},
	render: (args) => <Badge.Verified {...args} />,
} satisfies StoryObj<typeof Badge.Verified>

export const Claimed = {
	args: {
		isClaimed: true,
		hideTooltip: false,
	},
	parameters: {
		controls: {
			include: ['isClaimed', 'hideTooltip'],
		},
	},
	render: (args) => <Badge.Claimed {...args} />,
} satisfies StoryObj<typeof Badge.Claimed>

export const Unclaimed = {
	args: {
		isClaimed: false,
		hideTooltip: false,
	},
	parameters: {
		controls: {
			include: ['isClaimed', 'hideTooltip'],
		},
	},
	render: (args) => <Badge.Claimed {...args} />,
} satisfies StoryObj<typeof Badge.Claimed>

export const PrivatePractice = {
	args: {},
	parameters: {
		design: figmaSpec(
			'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?type=design&node-id=2908-7383&mode=design&t=P7ERsleiTj8PoFXM-4'
		),
	},
	render: (args) => <Badge.PrivatePractice {...args} />,
} satisfies StoryObj<typeof Badge.PrivatePractice>

export const VerifiedReviewer = {
	render: (args) => <Badge.VerifiedReviewer {...args} />,
} satisfies StoryObj<typeof Badge.VerifiedReviewer>

export const Remote = {
	render: (args) => <Badge.Remote {...args} />,
	parameters: {
		design: figmaSpec(
			'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?type=design&node-id=135-4631&mode=design&t=P7ERsleiTj8PoFXM-4'
		),
	},
} satisfies StoryObj<typeof Badge.Remote>

export const National = {
	args: {
		countries: ['US'],
	},
	render: (args) => <Badge.National {...args} />,
} satisfies StoryObj<typeof Badge.National>
export const NationalMultiple = {
	args: {
		countries: ['US', 'CA'],
	},
	render: (args) => <Badge.National {...args} />,
} satisfies StoryObj<typeof Badge.National>
