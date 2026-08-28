import { type Meta, type StoryObj } from '@storybook/nextjs'

import { Button } from '~ui/components/core/Button'
import { organization } from '~ui/mockData/organization'
import { orgSocialMedia } from '~ui/mockData/orgSocialMedia'

import { SocialMediaDrawer } from './index'

export default {
	title: 'Data Portal/Drawers/Social Media',
	component: SocialMediaDrawer,

	beforeEach({ msw }) {
		msw.use(
			organization.getIdFromSlug,
			orgSocialMedia.forEditDrawer,
			orgSocialMedia.update,
			orgSocialMedia.getServiceTypes
		)
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
		id: 'osmd_01GVH3VEVD93QH872SAPRYYCS2',
	},
} satisfies Meta<typeof SocialMediaDrawer>

type StoryDef = StoryObj<typeof SocialMediaDrawer>

export const Default = {} satisfies StoryDef
// export const WithoutData = {} satisfies StoryDef
