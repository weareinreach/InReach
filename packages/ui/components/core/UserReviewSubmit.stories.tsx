import { type Meta, type StoryObj } from '@storybook/react'

import { StorybookGridDouble } from '~ui/layouts/BodyGrid'
import { getTRPCMock } from '~ui/lib/getTrpcMock'

import { UserReviewSubmit as UserReviewPromptCompnt } from './UserReviewSubmit'

export default {
	title: 'Design System/User Review',
	component: UserReviewPromptCompnt,
	parameters: {
		layout: 'fullscreen',
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=339%3A6891&t=sleVeGl2lJv7Df18-4',
		},
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
	args: {},
	decorators: [StorybookGridDouble],
} satisfies Meta<typeof UserReviewPromptCompnt>

type StoryDef = StoryObj<typeof UserReviewPromptCompnt>

export const SubmitReview = {
	parameters: {
		nextAuthMock: {
			session: 'userPic',
		},
	},
} satisfies StoryDef

export const SubmitReviewNoPic = {
	parameters: {
		nextAuthMock: {
			session: 'userNoPic',
		},
	},
} satisfies StoryDef

export const SubmitReviewNoPicOrName = {
	parameters: {
		nextAuthMock: {
			session: 'userNoPicNoName',
		},
	},
} satisfies StoryDef

export const SubmitReviewNotLoggedIn = {
	parameters: {
		nextAuthMock: {
			session: 'noAuth',
		},
	},
} satisfies StoryDef
