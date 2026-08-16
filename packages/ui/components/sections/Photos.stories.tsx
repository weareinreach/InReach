import { type Meta, type StoryObj } from '@storybook/nextjs'

import { StorybookGridDouble } from '~ui/layouts'
import { orgPhoto } from '~ui/mockData/orgPhoto'

import { PhotosSection } from './Photos'

export default {
	title: 'Sections/Photos',
	component: PhotosSection,

	beforeEach({ msw }) {
		msw.use(orgPhoto.getByParent)
	},

	parameters: {
		layout: 'fullscreen',
	},

	args: {
		parentId: 'parentId',
	},

	decorators: [StorybookGridDouble],
} satisfies Meta<typeof PhotosSection>

type StoryDef = StoryObj<typeof PhotosSection>
export const Desktop10Photos = {} satisfies StoryDef

export const Desktop2Photos = {
	beforeEach({ msw }) {
		msw.use(orgPhoto.getByParent2)
	},
} satisfies StoryDef

export const Desktop4Photos = {
	beforeEach({ msw }) {
		msw.use(orgPhoto.getByParent4)
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
	beforeEach({ msw }) {
		msw.use(orgPhoto.getByParent2)
	},

	parameters: {
		viewport: {
			defaultViewport: 'iphonex',
		},
	},
} satisfies StoryDef

export const NoPhotos = {
	beforeEach({ msw }) {
		msw.use(orgPhoto.getByParent0)
	},
} satisfies StoryDef
