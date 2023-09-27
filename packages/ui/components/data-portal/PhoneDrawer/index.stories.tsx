import { type Meta, type StoryObj } from '@storybook/react'

import { Button } from '~ui/components/core/Button'
import { fieldOpt } from '~ui/mockData/fieldOpt'
import { organization } from '~ui/mockData/organization'
import { orgPhone } from '~ui/mockData/orgPhone'

import { PhoneDrawer } from '.'

export default {
	title: 'Data Portal/Drawers/Phone',
	component: PhoneDrawer,
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
		msw: [organization.getIdFromSlug, fieldOpt.countries, orgPhone.forEditDrawer],
	},
	args: {
		component: Button,
		children: 'Open Drawer',
		variant: 'inlineInvertedUtil1',
		id: 'oweb_01H29ENF8JTJ3FNJ5BQXDH4PMA',
	},
} satisfies Meta<typeof PhoneDrawer>

type StoryDef = StoryObj<typeof PhoneDrawer>

export const Default = {} satisfies StoryDef
// export const WithoutData = {} satisfies StoryDef
