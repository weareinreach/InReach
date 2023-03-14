import { Meta, StoryObj } from '@storybook/react'

import { StorybookGridDouble } from '~ui/layouts'
import { photosMock } from '~ui/mockData/photos'

import { PhotosSection } from './Photos'

export default {
	title: 'Sections/Photos',
	component: PhotosSection,
	args: {
		photos: photosMock,
	},
	decorators: [StorybookGridDouble],
} satisfies Meta<typeof PhotosSection>

type StoryDef = StoryObj<typeof PhotosSection>
export const Desktop = {} satisfies StoryDef

export const Mobile = {
	parameters: {
		viewport: {
			defaultViewport: 'iphonex',
		},
	},
} satisfies StoryDef
