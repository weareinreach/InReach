import { type Meta, type StoryObj } from '@storybook/react'

import { StorybookGridSingle } from '~ui/layouts'
import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { miscMock } from '~ui/mockData/misc'
import { orgEmail } from '~ui/mockData/orgEmail'
import { orgPhone } from '~ui/mockData/orgPhone'
import { orgSocialMedia } from '~ui/mockData/orgSocialMedia'
import { orgWebsite } from '~ui/mockData/orgWebsite'

import { ContactSection } from './Contact'

export default {
	title: 'Sections/Contact Info - Individual API',
	component: ContactSection,
	args: {
		parentId: 'parentId',
		role: 'org',
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
		msw: [
			getTRPCMock({
				path: ['organization', 'getIdFromSlug'],
				type: 'query',
				response: {
					id: 'orgn_ORGANIZATIONID',
				},
			}),
			orgEmail.forContactInfo,
			orgPhone.forContactInfo,
			orgWebsite.forContactInfo,
			orgSocialMedia.forContactInfo,
			miscMock.hasContactInfo,
		],
	},
	decorators: [StorybookGridSingle],
} satisfies Meta<typeof ContactSection>

type StoryDef = StoryObj<typeof ContactSection>
export const Desktop = {} satisfies StoryDef

export const Mobile = {
	parameters: {
		viewport: {
			defaultViewport: 'iphonex',
		},
	},
} satisfies StoryDef
