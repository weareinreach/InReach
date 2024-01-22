import { type Meta, type StoryObj } from '@storybook/react'

import { Button } from '~ui/components/core'
import { fieldOpt } from '~ui/mockData/fieldOpt'
import { organization } from '~ui/mockData/organization'

import { BadgeEditModal } from '.'

type StoryDef = StoryObj<typeof BadgeEditModal>
export default {
	title: 'Data Portal/Modals/Badge Edit',
	component: BadgeEditModal,
	parameters: {
		layout: 'fullscreen',
		layoutWrapper: 'centeredHalf',
		msw: [fieldOpt.orgBadges, organization.forBadgeEditModal],
		rqDevtools: true,
		whyDidYouRender: { collapseGroups: true },
	},
	args: {
		component: Button,
		children: 'Open Modal',
		orgId: 'orgn_123456',
	},
} satisfies Meta<typeof BadgeEditModal>

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
