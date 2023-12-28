import { type Meta, type StoryObj } from '@storybook/react'

import { organization } from '~ui/mockData/organization'
import { orgEmail } from '~ui/mockData/orgEmail'
import { orgPhone } from '~ui/mockData/orgPhone'
import { orgSocialMedia } from '~ui/mockData/orgSocialMedia'
import { orgWebsite } from '~ui/mockData/orgWebsite'

import { ContactInfo } from './ContactInfo'

export default {
	title: 'Data Display/Contact Info - Individual API',
	component: ContactInfo,
	args: {
		parentId: 'parentId',
	},
	parameters: {
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
			organization.getIdFromSlug,
			orgEmail.forContactInfo,
			orgPhone.forContactInfo,
			orgWebsite.forContactInfo,
			orgSocialMedia.forContactInfo,
		],
	},
} satisfies Meta<typeof ContactInfo>

type StoryDef = StoryObj<typeof ContactInfo>

export const Default = {} satisfies StoryDef

export const Direct = {
	args: {
		parentId: 'parentId',
		direct: true,
		order: ['phone', 'email', 'website'],
	},
} satisfies StoryDef
