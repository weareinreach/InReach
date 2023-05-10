import { type Meta, type StoryFn, type StoryObj } from '@storybook/react'
import { Fragment } from 'react'

import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { allFieldOptHandlers } from '~ui/mockData/fieldOpt'
import { getNames as getLocationNames } from '~ui/mockData/orgLocation'
import { getNames as getServiceNames } from '~ui/mockData/orgService'

import { formHookParams, PhoneEmailFormProvider, useForm } from './context'
import { PhoneEmailFlags, PhoneNumberEntry, PhoneTypeSelect } from './fields'

const FormContextDecorator = (Story: StoryFn) => {
	const form = useForm(formHookParams)
	return (
		<PhoneEmailFormProvider form={form}>
			<Story />
		</PhoneEmailFormProvider>
	)
}

// eslint-disable-next-line storybook/prefer-pascal-case
export const phoneEmailFieldMocks = [
	...allFieldOptHandlers,
	getTRPCMock({
		path: ['organization', 'getIdFromSlug'],
		type: 'query',
		response: {
			id: 'orgn_ORGANIZATIONID',
		},
	}),
	getTRPCMock({
		path: ['service', 'getNames'],
		response: getServiceNames,
	}),
	getTRPCMock({
		path: ['location', 'getNames'],
		response: getLocationNames,
	}),
]

export default {
	title: 'Data Portal/Modals/Add Phone or Email/Fields',
	component: Fragment,
	parameters: {
		msw: phoneEmailFieldMocks,
		rqDevtools: true,
		controls: {
			exclude: ['Component'],
		},
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
	decorators: [FormContextDecorator],
} satisfies Meta<typeof Fragment>

export const PhoneNumber = {
	render: PhoneNumberEntry,
} satisfies StoryObj<typeof PhoneNumberEntry>

export const PhoneTypeSelection = {
	render: PhoneTypeSelect,
} satisfies StoryObj<typeof PhoneTypeSelect>

export const BottomSection = {
	args: {
		role: 'email',
	},
	argTypes: {
		role: {
			options: ['email', 'phone'],
		},
	},
	render: (args) => <PhoneEmailFlags {...args} />,
} satisfies StoryObj<typeof PhoneEmailFlags>
