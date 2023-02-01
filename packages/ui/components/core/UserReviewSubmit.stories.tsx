import { faker } from '@faker-js/faker'
import { createId } from '@paralleldrive/cuid2'
import { Meta } from '@storybook/react'

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
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=150%3A6885&t=rT8aBd7wpIWpzM0I-0',
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
						id: createId(),
					},
				}),
				getTRPCMock({
					path: ['review', 'create'],
					type: 'mutation',
					response: {
						id: createId(),
					},
				}),
			],
		},
	},
	args: {},
	decorators: [StorybookGrid],
} as Meta<typeof UserReviewPromptCompnt>

export const SubmitReviewFullData = {
	args: {
		avatarUrl: faker.image.avatar(),
		avatarName: faker.name.fullName(),
	},
}

export const SubmitReviewNoAvatar = {
	args: {
		avatarUrl: null,
		avatarName: faker.name.fullName(),
	},
}

export const SubmitReviewNoData = {
	args: {
		avatarUrl: null,
		avatarName: null,
	},
}
