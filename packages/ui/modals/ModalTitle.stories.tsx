import { type Meta, type StoryObj } from '@storybook/nextjs'
import { action } from 'storybook/actions'

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
			onClick: () => action('close clicked')(),
		},
	},
} satisfies StoryDef

export const Back = {
	args: {
		breadcrumb: {
			option: 'back',
			backTo: 'none',
			onClick: () => action('close clicked')(),
		},
	},
} satisfies StoryDef

export const BackToSearch = {
	args: {
		breadcrumb: {
			option: 'back',
			backTo: 'search',
			onClick: () => action('close clicked')(),
		},
	},
} satisfies StoryDef

export const BackToDynamicText = {
	args: {
		breadcrumb: {
			option: 'back',
			backTo: 'dynamicText',
			backToText: 'Customizable text',
			onClick: () => action('close clicked')(),
		},
	},
} satisfies StoryDef

export const BackToDynamicTextWithIcons = {
	args: {
		breadcrumb: {
			option: 'back',
			backTo: 'dynamicText',
			backToText: 'Customizable text',
			onClick: () => action('close clicked')(),
		},
		icons: ['share', 'save'],
	},
} satisfies StoryDef
