import { type Meta, type StoryObj } from '@storybook/react'

import { Button } from '~ui/components/core/Button'
import { organization } from '~ui/mockData/organization'
import { orgWebsite } from '~ui/mockData/orgWebsite'

import { WebsiteDrawer } from './index'

export default {
	title: 'Data Portal/Drawers/Website',
	component: WebsiteDrawer,
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
		msw: [organization.getIdFromSlug, orgWebsite.forEditDrawer, orgWebsite.update],
	},
	args: {
		component: Button,
		children: 'Open Drawer',
		variant: 'inlineInvertedUtil1',
		id: 'oweb_01H29ENF8JTJ3FNJ5BQXDH4PMA',
	},
} satisfies Meta<typeof WebsiteDrawer>

type StoryDef = StoryObj<typeof WebsiteDrawer>

export const Default = {} satisfies StoryDef
// export const WithoutData = {} satisfies StoryDef
