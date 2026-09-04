import { type Meta, type StoryObj } from '@storybook/nextjs'

import { Button } from '~ui/components/core/Button'
import { service } from '~ui/mockData/service'

import { DuplicateServiceModal } from './index'

export default {
	title: 'Data Portal/Modals/Duplicate Service',
	component: DuplicateServiceModal,

	beforeEach({ msw }) {
		msw.use(service.forDuplicateWizard, service.duplicate)
	},

	parameters: {
		layout: 'fullscreen',
		layoutWrapper: 'centeredHalf',
		rqDevtools: true,
		nextjs: {
			router: {
				pathname: '/org/[slug]/[orgLocationId]/edit',
				asPath: '/org/mock-org-slug/oloc_mock',
				query: {
					slug: 'mock-org-slug',
					orgLocationId: 'oloc_mock',
				},
			},
		},
	},

	args: {
		component: Button,
		children: 'Copy',
		variant: 'primary',
		sourceServiceId: 'osvc_MOCKSOURCESERVICE001',
	},
} satisfies Meta<typeof DuplicateServiceModal>

type StoryDef = StoryObj<typeof DuplicateServiceModal>

export const Default = {} satisfies StoryDef
