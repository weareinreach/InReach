import { Meta, StoryObj } from '@storybook/react'

import { ContactInfo } from './ContactInfo'

export default {
	title: 'Data Display/Contact Info',
	component: ContactInfo,
} satisfies Meta<typeof ContactInfo>

type StoryDef = StoryObj<typeof ContactInfo>

export const Default = {} satisfies StoryDef
