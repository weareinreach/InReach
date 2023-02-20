import { Meta, StoryObj } from '@storybook/react'

import { UserReviewSubmit as UserReviewPromptCompnt } from './UserReviewSubmit'
import { getTRPCMock } from '../../lib/getTrpcMock'
import { StorybookGrid } from '../layout'

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
	decorators: [StorybookGrid],
} satisfies Meta<typeof UserReviewPromptCompnt>

type StoryDef = StoryObj<typeof UserReviewPromptCompnt>

export const SubmitReviewFullData = {
	args: {
		avatarName: 'Reviewer Name',
		avatarUrl: 'https://i.pravatar.cc/50?u=1234567',
	},
} satisfies StoryDef

export const SubmitReviewNoAvatar = {
	args: {
		avatarUrl: null,
		avatarName: 'User NoPic',
	},
} satisfies StoryDef

export const SubmitReviewNoData = {
	args: {
		avatarUrl: null,
		avatarName: null,
	},
} satisfies StoryDef
