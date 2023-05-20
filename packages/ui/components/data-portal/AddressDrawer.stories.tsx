import { type Meta, type StoryObj } from '@storybook/react'

import { Button } from '~ui/components/core'

import { AddressDrawer } from './AddressDrawer'

export default {
	title: 'Data Portal/Drawers/Address',
	component: AddressDrawer,
	parameters: {
		layout: 'fullscreen',
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
		children: 'Open Drawer',
		variant: 'inlineInvertedUtil1',
	},
} satisfies Meta<typeof AddressDrawer>

type StoryDef = StoryObj<typeof AddressDrawer>

export const Default = {} satisfies StoryDef
