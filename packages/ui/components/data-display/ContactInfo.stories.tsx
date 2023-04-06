import { Meta, StoryObj } from '@storybook/react'

import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { contactMock, singleContactMock } from '~ui/mockData/contactSection'

import { ContactInfo } from './ContactInfo'

export default {
	title: 'Data Display/Contact Info',
	component: ContactInfo,
	args: {
		data: contactMock,
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
			getTRPCMock({
				path: ['organization', 'getIdFromSlug'],
				type: 'query',
				response: {
					id: 'orgn_ORGANIZATIONID',
				},
			}),
		],
	},
} satisfies Meta<typeof ContactInfo>

type StoryDef = StoryObj<typeof ContactInfo>

export const Default = {} satisfies StoryDef

export const Direct = {
	args: {
		data: singleContactMock,
		direct: true,
		order: ['phone', 'email', 'website'],
	},
} satisfies StoryDef
