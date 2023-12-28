import { type Meta, type StoryFn, type StoryObj } from '@storybook/react'
import { Fragment } from 'react'

import { allFieldOptHandlers } from '~ui/mockData/fieldOpt'
import { location } from '~ui/mockData/location'
import { organization } from '~ui/mockData/organization'
import { service } from '~ui/mockData/service'

import { formHookParams, PhoneEmailFormProvider, useForm } from './context'
import { PhoneEmailFlags, PhoneTypeSelect } from './fields'

const FormContextDecorator = (Story: StoryFn) => {
	const form = useForm(formHookParams)
	return (
		<PhoneEmailFormProvider form={form}>
			<Story />
		</PhoneEmailFormProvider>
	)
}

export const phoneEmailFieldMocks = [
	...allFieldOptHandlers,
	organization.getIdFromSlug,
	location.getNames,
	service.getNames,
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
	excludeStories: ['phoneEmailFieldMocks'],
} satisfies Meta<typeof Fragment>

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
