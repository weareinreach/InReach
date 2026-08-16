import { type Meta, type StoryObj } from '@storybook/nextjs'

import { Button } from '~ui/components/core'
import { fieldOpt } from '~ui/mockData/fieldOpt'
import { organization } from '~ui/mockData/organization'

import { BadgeEdit } from '.'

type StoryDef = StoryObj<typeof BadgeEdit>
export default {
	title: 'Data Portal/Modals/Badge Edit',
	component: BadgeEdit,

	beforeEach({ msw }) {
		msw.use(fieldOpt.orgBadges, organization.forBadgeEditModal, organization.updateAttributesBasic)
	},

	parameters: {
		layout: 'fullscreen',
		layoutWrapper: 'centeredHalf',
		rqDevtools: true,
		whyDidYouRender: { collapseGroups: true },
	},

	args: {
		component: Button,
		children: 'Open Modal',
		orgId: 'orgn_123456',
	},
} satisfies Meta<typeof BadgeEdit>

export const OrgLeader = {
	args: {
		badgeType: 'organization-leadership',
		orgId: 'orgn_123456',
	},
} satisfies StoryDef
export const ServiceFocus = {
	args: {
		badgeType: 'service-focus',
		orgId: 'orgn_123456',
	},
} satisfies StoryDef
