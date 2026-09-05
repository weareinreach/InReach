import { type Meta, type StoryObj } from '@storybook/nextjs'

import { StorybookGridDouble } from '~ui/layouts'
import { component } from '~ui/mockData/component'
import { allFieldOptHandlers } from '~ui/mockData/fieldOpt'
import { orgHours } from '~ui/mockData/orgHours'
import { service } from '~ui/mockData/service'
import { serviceArea } from '~ui/mockData/serviceArea'

import { ServicesInfoCard } from './ServicesInfo'

export default {
	title: 'Sections/Services Info',
	component: ServicesInfoCard,

	args: {
		parentId: 'orgn_01GVH3V408N0YS7CDYAH3F2BMH',
	},

	argTypes: {
		hideRemoteBadges: { control: 'boolean' },
	},

	beforeEach({ msw }) {
		msw.use(
			service.forServiceInfoCard,
			service.getParentName,
			service.forServiceModal,
			// Needed for the edit-mode row's ServiceEditDrawer/DuplicateServiceModal triggers - unused,
			// harmless overhead on the read-only (non-edit-mode) stories.
			service.getNames,
			service.forServiceEditDrawer,
			service.getOptions,
			service.forDuplicateWizard,
			service.duplicate,
			component.ServiceSelect,
			orgHours.forHoursDisplay,
			serviceArea.addToArea,
			serviceArea.delFromArea,
			...allFieldOptHandlers
		)
	},

	parameters: {
		layout: 'fullscreen',

		nextjs: {
			router: {
				pathname: '/org/[slug]',
				asPath: '/org/mockOrg',
				query: {
					slug: 'mockOrg',
				},
			},
		},

		rqDevtools: true,
	},

	decorators: [StorybookGridDouble],
} satisfies Meta<typeof ServicesInfoCard>

type StoryDef = StoryObj<typeof ServicesInfoCard>
export const Desktop = {} satisfies StoryDef

export const Mobile = {
	parameters: {
		viewport: {
			defaultViewport: 'iphonex',
		},
	},
} satisfies StoryDef

// The only story that actually exercises the edit-mode row rendering (ServiceEditDrawer trigger +
// the new DuplicateServiceModal copy icon) - isEditMode is derived purely from the router pathname
// (~ui/hooks/useEditMode), so Desktop/Mobile above never reach that branch at all.
export const EditMode = {
	parameters: {
		nextjs: {
			router: {
				pathname: '/org/[slug]/[orgLocationId]/edit',
				asPath: '/org/mockOrg/oloc_mockLocation',
				query: {
					slug: 'mockOrg',
					orgLocationId: 'oloc_mockLocation',
				},
			},
		},
	},
} satisfies StoryDef
