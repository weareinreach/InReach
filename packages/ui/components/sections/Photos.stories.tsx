import { Meta, StoryObj } from '@storybook/react'

import { StorybookGridDouble } from '~ui/layouts'
import { photosMock } from '~ui/mockData/photos'

import { PhotosSection } from './Photos'

export default {
	title: 'Sections/Photos',
	component: PhotosSection,
	parameters: {
		layout: 'fullscreen',
	},
	args: {
		photos: photosMock,
	},
	decorators: [StorybookGridDouble],
} satisfies Meta<typeof PhotosSection>

type StoryDef = StoryObj<typeof PhotosSection>
export const Desktop10Photos = {} satisfies StoryDef

export const Desktop2Photos = {
	args: {
		photos: photosMock.slice(0, 2),
	},
} satisfies StoryDef

export const Desktop4Photos = {
	args: {
		photos: photosMock.slice(0, 4),
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
	args: {
		photos: photosMock.slice(0, 2),
	},
	parameters: {
		viewport: {
			defaultViewport: 'iphonex',
		},
	},
} satisfies StoryDef

export const NoPhotos = {
	args: {
		photos: [],
	},
} satisfies StoryDef
