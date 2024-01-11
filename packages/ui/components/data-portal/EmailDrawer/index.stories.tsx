import { type Meta, type StoryObj } from '@storybook/react'

import { Button } from '~ui/components/core/Button'
import { organization } from '~ui/mockData/organization'
import { orgEmail } from '~ui/mockData/orgEmail'

import { EmailDrawer } from './index'

export default {
	title: 'Data Portal/Drawers/Email',
	component: EmailDrawer,
	parameters: {
		layout: 'fullscreen',
		rqDevtools: true,
		// wdyr: true,
		nextjs: {
			router: {
				pathname: '/org/[slug]/edit',
				asPath: '/org/mock-org-slug',
				query: {
					slug: 'mock-org-slug',
				},
			},
		},
		msw: [organization.getIdFromSlug, orgEmail.forContactInfoEdit, orgEmail.forEditDrawer],
	},
	args: {
		component: Button,
		children: 'Open Drawer',
		variant: 'inlineInvertedUtil1',
	},
} satisfies Meta<typeof EmailDrawer>

type StoryDef = StoryObj<typeof EmailDrawer>

export const WithData = {
	args: {
		locationId: 'oloc_01GVH3VEVBERFNA9PHHJYEBGA3',
	},
} satisfies StoryDef
export const WithoutData = {} satisfies StoryDef
