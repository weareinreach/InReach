import { type Meta, type StoryObj } from '@storybook/react'

import { Button } from '~ui/components/core/Button'

import { phoneEmailFieldMocks } from './fields.stories'
import { PhoneEmailModal } from './index'

export default {
	title: 'Data Portal/Modals/Add Phone or Email',
	component: PhoneEmailModal,
	parameters: {
		layout: 'fullscreen',
		layoutWrapper: 'centeredHalf',
		msw: phoneEmailFieldMocks,
		rqDevtools: true,
		nextjs: {
			router: {
				pathname: '/org/[slug]/edit',
				asPath: '/org/mock-org-slug',
				query: {
					slug: 'mock-org-slug',
				},
			},
		},
	},
	args: {
		component: Button,
		children: 'Open Modal',
		variant: 'inlineInvertedUtil1',
	},
} satisfies Meta<typeof PhoneEmailModal>
type StoryDef = StoryObj<typeof PhoneEmailModal>

export const Modal_Phone = {
	args: {
		role: 'phone',
	},
} satisfies StoryDef

export const Modal_Email = {
	args: {
		role: 'email',
	},
} satisfies StoryDef
