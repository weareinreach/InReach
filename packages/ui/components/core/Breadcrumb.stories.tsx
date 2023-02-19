import { Meta, StoryObj } from '@storybook/react'
import React from 'react'

import { Breadcrumb as BreadcrumbCompnent } from './Breadcrumb'

export default {
	title: 'Design System/Breadcrumb',
	component: BreadcrumbCompnent,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=297%3A6037&t=sleVeGl2lJv7Df18-4',
		},
	},
} satisfies Meta<typeof BreadcrumbCompnent>

type StoryDef = StoryObj<typeof BreadcrumbCompnent>
export const BackToSearch = {
	args: {
		href: '/',
		option: 'back',
	},
} satisfies StoryDef
export const Close = {
	args: {
		href: '/',
		option: 'close',
	},
} satisfies StoryDef
