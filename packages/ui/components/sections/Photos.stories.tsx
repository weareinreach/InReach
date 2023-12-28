import { type Meta, type StoryObj } from '@storybook/react'

import { StorybookGridDouble } from '~ui/layouts'
import { orgPhoto } from '~ui/mockData/orgPhoto'

import { PhotosSection } from './Photos'

export default {
	title: 'Sections/Photos',
	component: PhotosSection,
	parameters: {
		layout: 'fullscreen',
		msw: [orgPhoto.getByParent],
	},
	args: {
		parentId: 'parentId',
	},

	decorators: [StorybookGridDouble],
} satisfies Meta<typeof PhotosSection>

type StoryDef = StoryObj<typeof PhotosSection>
export const Desktop10Photos = {} satisfies StoryDef

export const Desktop2Photos = {
	parameters: {
		msw: [orgPhoto.getByParent2],
	},
} satisfies StoryDef

export const Desktop4Photos = {
	parameters: {
		msw: [orgPhoto.getByParent4],
	},
} satisfies StoryDef

export const Mobile = {
	parameters: {
		viewport: {
			defaultViewport: 'iphonex',
		},
	},
} satisfies StoryDef

export const Mobile2Photos = {
	parameters: {
		viewport: {
			defaultViewport: 'iphonex',
		},
		msw: [orgPhoto.getByParent2],
	},
} satisfies StoryDef

export const NoPhotos = {
	parameters: {
		msw: [orgPhoto.getByParent0],
	},
} satisfies StoryDef
