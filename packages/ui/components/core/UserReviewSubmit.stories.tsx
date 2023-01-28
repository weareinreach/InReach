import { faker } from '@faker-js/faker'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import React from 'react'

import { UserReviewSubmit as UserReviewPromptCompnt } from './UserReviewSubmit'

export default {
	title: 'Design System/User Review',
	component: UserReviewPromptCompnt,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=150%3A6885&t=rT8aBd7wpIWpzM0I-0',
		},
	},
} as ComponentMeta<typeof UserReviewPromptCompnt>

const UserReviewSubmit: ComponentStory<typeof UserReviewPromptCompnt> = (args) => (
	<UserReviewPromptCompnt {...args} />
)

export const SubmitReviewFullData = UserReviewSubmit.bind({})
export const SubmitReviewNoAvatar = UserReviewSubmit.bind({})
export const SubmitReviewNoData = UserReviewSubmit.bind({})

SubmitReviewFullData.args = {
	avatarUrl: faker.image.avatar(),
	avatarName: faker.name.fullName(),
}

SubmitReviewNoAvatar.args = {
	avatarUrl: null,
	avatarName: faker.name.fullName(),
}

SubmitReviewNoData.args = {
	avatarUrl: null,
	avatarName: null,
}
