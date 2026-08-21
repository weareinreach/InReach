import { type Meta, type StoryObj } from '@storybook/nextjs'

import { Button } from '~ui/components/core/Button'
import { organization } from '~ui/mockData/organization'
import { orgWebsite } from '~ui/mockData/orgWebsite'

import { WebsiteDrawer } from './index'

export default {
	title: 'Data Portal/Drawers/Website',
	component: WebsiteDrawer,

	beforeEach({ msw }) {
		msw.use(organization.getIdFromSlug, orgWebsite.forEditDrawer, orgWebsite.update)
	},

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
		variant: 'primary',
		id: 'oweb_01H29ENF8JTJ3FNJ5BQXDH4PMA',
	},
} satisfies Meta<typeof WebsiteDrawer>

type StoryDef = StoryObj<typeof WebsiteDrawer>

export const Default = {} satisfies StoryDef
// export const WithoutData = {} satisfies StoryDef
