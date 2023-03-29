import { Meta, StoryObj } from '@storybook/react'

import { getTRPCMock } from '~ui/lib/getTrpcMock'

import { ActionButtons as ActionButtonsComponent } from './ActionButtons'

export default {
	title: 'Design System/Action Buttons',
	component: ActionButtonsComponent,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=52%3A1420&t=sleVeGl2lJv7Df18-4',
		},
		layout: 'fullscreen',
		layoutWrapper: 'centeredHalf',
		nextjs: {
			router: {
				pathname: '/org/[slug]',
				asPath: '/org/mockOrg',
				query: {
					slug: 'mockOrg',
				},
			},
		},
		msw: {
			handlers: [
				getTRPCMock({
					path: ['organization', 'getIdFromSlug'],
					type: 'query',
					response: {
						id: 'orgn_ORGANIZATIONID',
					},
				}),
				getTRPCMock({
					path: ['review', 'create'],
					type: 'mutation',
					response: {
						id: 'orev_NEWREVIEWID',
					},
				}),
			],
		},
	},
	render: ({ iconKey }) => (
		<div>
			<ActionButtonsComponent iconKey={iconKey} />
		</div>
	),
} satisfies Meta<typeof ActionButtonsComponent>

type StoryDef = StoryObj<typeof ActionButtonsComponent>

export const Save = {
	parameters: {
		nextAuthMock: {
			session: 'userPic',
		},
	},
	args: {
		iconKey: 'save',
	},
}

export const SaveLoggedOut = {
	parameters: {
		nextAuthMock: {
			session: 'noAuth',
		},
	},
	args: {
		iconKey: 'save',
	},
} satisfies StoryDef

export const Saved = {
	args: {
		iconKey: 'saved',
	},
} satisfies StoryDef
export const Share = {
	args: {
		iconKey: 'share',
	},
} satisfies StoryDef
export const Print = {
	args: {
		iconKey: 'print',
	},
} satisfies StoryDef
export const Delete = {
	args: {
		iconKey: 'delete',
	},
} satisfies StoryDef
export const Review = {
	args: {
		iconKey: 'review',
	},
} satisfies StoryDef
export const More = {
	parameters: {
		nextAuthMock: {
			session: 'userPic',
		},
	},
	args: {
		iconKey: 'more',
	},
} satisfies StoryDef
