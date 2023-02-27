import { Meta, StoryObj } from '@storybook/react'

import { ModalTitle } from './ModalTitle'

export default {
	title: 'Modals/Title Bar',
	component: ModalTitle,
} satisfies Meta<typeof ModalTitle>

type StoryDef = StoryObj<typeof ModalTitle>

export const Close = {
	args: {
		breadcrumb: {
			option: 'close',
		},
	},
} satisfies StoryDef

export const Back = {
	args: {
		breadcrumb: {
			option: 'back',
			backTo: 'none',
		},
	},
} satisfies StoryDef

export const BackToSearch = {
	args: {
		breadcrumb: {
			option: 'back',
			backTo: 'search',
		},
	},
} satisfies StoryDef

export const BackToDynamicText = {
	args: {
		breadcrumb: {
			option: 'back',
			backTo: 'dynamicText',
			backToText: 'Customizable text',
		},
	},
} satisfies StoryDef

export const BackToDynamicTextWithIcons = {
	args: {
		breadcrumb: {
			option: 'back',
			backTo: 'dynamicText',
			backToText: 'Customizable text',
		},
		icons: ['share', 'save'],
	},
} satisfies StoryDef
