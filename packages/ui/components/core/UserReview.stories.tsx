import { faker } from '@faker-js/faker'
import { Center } from '@mantine/core'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import React from 'react'

import { UserReview } from './UserReview'

export default {
	title: 'Design System/User Review',
	component: UserReview,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=150%3A6885&t=xfoVF0P9A9vO56xj-0',
		},
	},
} as ComponentMeta<typeof UserReview>

const UserReviewVariant: ComponentStory<typeof UserReview> = (args) => <UserReview {...args} />

export const UserReviewVariantUserFullData = UserReviewVariant.bind({})
export const UserReviewVariantUserNoDataUnverified = UserReviewVariant.bind({})
export const UserReviewVariantUserShortReview = UserReviewVariant.bind({})
export const UserReviewVariantUserUnverified = UserReviewVariant.bind({})
export const UserReviewVariantUserOnlyName = UserReviewVariant.bind({})

UserReviewVariantUserFullData.args = {
	user: {
		avatarUrl: faker.image.avatar(),
		avatarName: faker.name.fullName(),
	},
	reviewText: faker.lorem.paragraph(),
	verifiedUser: true,
}

UserReviewVariantUserNoDataUnverified.args = {
	user: {
		avatarUrl: null,
		avatarName: null,
	},
	reviewText: faker.lorem.paragraph(),
	verifiedUser: false,
}

UserReviewVariantUserShortReview.args = {
	user: {
		avatarUrl: faker.image.avatar(),
		avatarName: faker.name.fullName(),
	},
	reviewText: faker.lorem.sentence(),
	verifiedUser: true,
}
UserReviewVariantUserUnverified.args = {
	user: {
		avatarUrl: faker.image.avatar(),
		avatarName: faker.name.fullName(),
	},
	reviewText: faker.lorem.paragraph(),
	verifiedUser: false,
}

UserReviewVariantUserOnlyName.args = {
	user: {
		avatarUrl: null,
		avatarName: faker.name.fullName(),
	},
	reviewText: faker.lorem.paragraph(),
	verifiedUser: true,
}
