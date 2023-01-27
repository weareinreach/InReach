import { faker } from '@faker-js/faker'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import React from 'react'

import { UserReviewPrompt as UserReviewPromptCompnt } from './UserReviewPrompt'

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

const UserReviewPromptVariant: ComponentStory<typeof UserReviewPromptCompnt> = (args) => <UserReviewPromptCompnt {...args} />

export const UserReviewPromptVariantFullData = UserReviewPromptVariant.bind({})
export const UserReviewPromptVariantNoAvatar = UserReviewPromptVariant.bind({})
export const UserReviewPromptVariantNoData = UserReviewPromptVariant.bind({})


UserReviewPromptVariantFullData.args = {
    avatarUrl: faker.image.avatar(),
    avatarName: faker.name.fullName(),
}

UserReviewPromptVariantNoAvatar.args = {
    avatarUrl: null,
    avatarName: faker.name.fullName(),
}

UserReviewPromptVariantNoData.args = {
    avatarUrl: null,
    avatarName: null,
}