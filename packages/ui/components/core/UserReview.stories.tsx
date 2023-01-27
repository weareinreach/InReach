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
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=150%3A7027&t=OPIs2wdc5n2td3Nf-4',
		},
	},
} as ComponentMeta<typeof UserReview>

const UserReviewVariant: ComponentStory<typeof UserReview> = (args) => <UserReview {...args} />

export const VerifiedWithNameAndPicture = UserReviewVariant.bind({})
export const VerifiedWithNameOnly = UserReviewVariant.bind({})
export const UnverifiedAnonymous = UserReviewVariant.bind({})
export const UnverifiedShortWithNameAndPicture = UserReviewVariant.bind({})
export const UnverifiedWithNameAndPicture = UserReviewVariant.bind({})

VerifiedWithNameAndPicture.args = {
	user: {
		image: faker.image.avatar(),
		name: faker.name.fullName(),
	},
	reviewText: faker.lorem.paragraph(),
	verifiedUser: true,
}

UnverifiedAnonymous.args = {
	user: {
		image: null,
		name: null,
	},
	reviewText: faker.lorem.paragraph(),
	verifiedUser: false,
}

UnverifiedShortWithNameAndPicture.args = {
	user: {
		image: faker.image.avatar(),
		name: faker.name.fullName(),
	},
	reviewText: faker.lorem.sentence(8),
	verifiedUser: true,
}
UnverifiedWithNameAndPicture.args = {
	user: {
		image: faker.image.avatar(),
		name: faker.name.fullName(),
	},
	reviewText: faker.lorem.paragraph(),
	verifiedUser: false,
}

VerifiedWithNameOnly.args = {
	user: {
		image: null,
		name: faker.name.fullName(),
	},
	reviewText: faker.lorem.paragraph(),
	verifiedUser: true,
}
