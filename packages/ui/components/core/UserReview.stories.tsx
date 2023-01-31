import { faker } from '@faker-js/faker'
import { Center } from '@mantine/core'
import { Meta, StoryFn } from '@storybook/react'
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
} as Meta<typeof UserReview>

export const VerifiedWithNameAndPicture = {
	args: {
		user: {
			image: faker.image.avatar(),
			name: faker.name.fullName(),
		},
		reviewText: faker.lorem.paragraph(),
		verifiedUser: true,
	},
}

export const VerifiedWithNameOnly = {
	args: {
		user: {
			image: null,
			name: faker.name.fullName(),
		},
		reviewText: faker.lorem.paragraph(),
		verifiedUser: true,
	},
}

export const UnverifiedAnonymous = {
	args: {
		user: {
			image: null,
			name: null,
		},
		reviewText: faker.lorem.paragraph(),
		verifiedUser: false,
	},
}

export const UnverifiedShortWithNameAndPicture = {
	args: {
		user: {
			image: faker.image.avatar(),
			name: faker.name.fullName(),
		},
		reviewText: faker.lorem.sentence(8),
		verifiedUser: true,
	},
}

export const UnverifiedWithNameAndPicture = {
	args: {
		user: {
			image: faker.image.avatar(),
			name: faker.name.fullName(),
		},
		reviewText: faker.lorem.paragraph(),
		verifiedUser: false,
	},
}
