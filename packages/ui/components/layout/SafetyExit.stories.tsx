import { BADGE } from '@geometricpanda/storybook-addon-badges'
import { ComponentMeta, ComponentStory } from '@storybook/react'

import React from 'react'

import { SafetyExit } from './SafetyExit'

export default {
	title: 'App/Navigation/SafetyExitButton',
	component: SafetyExit,
	decorators: [(Story) => <Story />],
	parameters: {
		badges: [BADGE.BETA],
	},
} as ComponentMeta<typeof SafetyExit>

export const SafetyExitButton: ComponentStory<typeof SafetyExit> = () => <SafetyExit />

// export const SafetyExitButton = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
// SafetyExitButton.args = {}
