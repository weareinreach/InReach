import { Meta, StoryObj } from '@storybook/react'

import { commonTheme as theme } from '~ui/theme/common'

import { Badge, BadgeGroup } from './Badge'

export default {
	title: 'Design System/Tags and Badges',
	component: Badge,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=234%3A8505&t=sleVeGl2lJv7Df18-4',
		},
	},
	argTypes: {
		variant: {
			options: [
				'commmunity',
				'service',
				'leader',
				'verified',
				'claimed',
				'unclaimed',
				'attribute',
				'verifiedUser',
			],
			control: 'select',
		},
		color: {
			control: {
				type: 'color',
				if: {
					arg: 'variant',
					eq: 'leader',
				},
			},
		},
		icon: {
			control: {
				if: {
					arg: 'variant',
					eq: ['leader', 'attribute', 'community', 'community'],
				},
			},
		},
		tsKey: {
			control: {
				if: {
					arg: 'variant',
					eq: ['leader', 'attribute'],
				},
			},
		},
		minify: {
			control: {
				if: {
					arg: 'variant',
					eq: 'leader',
				},
			},
		},
		hideBg: {
			control: {
				if: {
					arg: 'variant',
					eq: 'leader',
				},
			},
		},
		lastVerifiedDate: {
			control: {
				if: {
					arg: 'variant',
					eq: 'verified',
				},
			},
		},
		tsNs: {
			control: {
				if: {
					if: {
						arg: 'variant',
						eq: 'attribute',
					},
				},
			},
		},
	},
} satisfies Meta<typeof Badge>
type StoryDef = StoryObj<typeof Badge>
type GroupStory = StoryObj<typeof BadgeGroup>

const groupParams = {
	argTypes: {
		badges: {
			control: 'object',
		},
		withSeparator: {
			control: 'boolean',
		},
	},
	parameters: {
		controls: {
			include: ['badges', 'withSeparator'],
		},
	},
	render: (args) => <BadgeGroup {...args} />,
} satisfies GroupStory

export const Attribute = {
	args: {
		variant: 'attribute',
		icon: 'carbon:piggy-bank',
		tsKey: 'cost-cost-free',
		tsNs: 'attribute',
	},
	argTypes: {
		variant: {
			options: ['attribute'],
			control: 'select',
		},
		icon: {
			options: ['carbon:piggy-bank', 'carbon:globe', 'carbon:accessibility', 'carbon:warning'],
			control: 'select',
		},
		tsKey: {
			options: ['cost-cost-free', 'additional-remote', 'additional-accessible', 'additional-not-accessible'],
			control: 'select',
		},
		tsNs: {
			options: ['attribute'],
			control: 'select',
		},
	},
	parameters: {
		controls: {
			include: ['icon', 'tsKey', 'tsNs', 'variant'],
		},
	},
} satisfies StoryDef

export const Community = {
	args: {
		icon: '✊🏿',
		tsKey: 'srvfocus-bipoc-comm',
		variant: 'community',
	},
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=234%3A8506&t=sleVeGl2lJv7Df18-4',
		},
		controls: {
			include: ['icon', 'tsKey', 'variant'],
		},
	},
} satisfies StoryDef

export const CommunityGroup = {
	args: {
		badges: [
			{
				icon: '✊🏿',
				tsKey: 'srvfocus-bipoc-comm',
				variant: 'community',
			},
			{
				icon: '💛',
				tsKey: 'srvfocus-hiv-comm',
				variant: 'community',
			},
			{
				icon: '🗣',
				tsKey: 'srvfocus-spanish-speakers',
				variant: 'community',
			},
		],
	},
	...groupParams,
} satisfies GroupStory

export const Leader = {
	args: {
		variant: 'leader',
		color: theme.other!.colors.tertiary.lightBlue,
		icon: '️‍️‍🌎',
		tsKey: 'immigrant-led',
		minify: false,
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
			include: ['variant', 'color', 'icon', 'tsKey', 'minify', 'hideBg'],
		},
	},
} satisfies StoryDef

export const LeaderMini = {
	args: {
		variant: 'leader',
		color: theme.other!.colors.tertiary.orange,
		icon: '️‍️‍✊🏿',
		tsKey: 'black-led',
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
			include: ['variant', 'color', 'icon', 'tsKey', 'minify', 'hideBg'],
		},
	},
} satisfies StoryDef

export const Service = {
	args: {
		tsKey: 'abortion-care.CATEGORYNAME',
		variant: 'service',
	},
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=234%3A8508&t=sleVeGl2lJv7Df18-4',
		},
		controls: {
			include: ['tsKey', 'variant'],
		},
	},
} satisfies StoryDef

export const ServiceGroup = {
	args: {
		badges: [
			{
				tsKey: 'abortion-care.CATEGORYNAME',
				variant: 'service',
			},
			{
				tsKey: 'education-and-employment.CATEGORYNAME',
				variant: 'service',
			},
			{
				tsKey: 'food.CATEGORYNAME',
				variant: 'service',
			},
		],
	},
	...groupParams,
} satisfies GroupStory

export const Verified = {
	args: {
		variant: 'verified',
		lastVerifiedDate: new Date(2023, 1, 15),
	},
	parameters: {
		controls: {
			include: ['lastVerifiedDate', 'variant'],
		},
	},
} satisfies StoryDef

export const Claimed = {
	args: {
		variant: 'claimed',
	},
	parameters: {
		controls: {
			include: ['variant'],
		},
	},
} satisfies StoryDef

export const Unclaimed = {
	args: {
		variant: 'unclaimed',
	},
	parameters: {
		controls: {
			include: ['variant'],
		},
	},
} satisfies StoryDef

export const PrivatePractice = {
	args: {
		variant: 'privatePractice',
	},
	parameters: {
		controls: {
			include: ['variant'],
		},
	},
} satisfies StoryDef

export const VerifiedReviewer = {
	args: {
		variant: 'verifiedReviewer',
	},
	parameters: {
		controls: {
			include: ['variant'],
		},
	},
} satisfies StoryDef
