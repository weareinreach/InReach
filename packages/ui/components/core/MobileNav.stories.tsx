import { Meta, StoryFn } from '@storybook/react'
import React from 'react'

import { MobileNav as MobileNavComponent } from './MobileNav'
import { StorybookGrid } from '../layout/BodyGrid'

export default {
	title: 'Design System/Mobile Navigation',
	component: MobileNavComponent,
	parameters: {
		layout: 'fullscreen',
		viewport: {
			defaultViewport: 'iphone5',
		},
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=68%3A389&t=6tj0T5JJT9cer7Q6-0',
		},
		docs: {
			inlineStories: false,
		},
	},
	decorators: [StorybookGrid],
} as Meta<typeof MobileNavComponent>

export const MobileNavigation = {}
