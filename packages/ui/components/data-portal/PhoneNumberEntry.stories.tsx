import { type Meta, type StoryFn, type StoryObj } from '@storybook/react'
import { FormProvider, useForm as useHookForm } from 'react-hook-form'

import { fieldOpt } from '~ui/mockData/fieldOpt'
import {
	formHookParams,
	PhoneEmailFormProvider,
	useForm,
	useFormContext,
} from '~ui/modals/dataPortal/PhoneEmail/context'

import { PhoneNumberEntry } from './PhoneNumberEntry'
import { PhoneNumberEntry as PhoneNumberEntryHookForm } from './PhoneNumberEntryHookForm'

const FormContextDecorator = (Story: StoryFn) => {
	const form = useForm(formHookParams)
	return (
		<PhoneEmailFormProvider form={form}>
			<Story />
		</PhoneEmailFormProvider>
	)
}
const HookFormContextDecorator = (Story: StoryFn) => {
	const form = useHookForm<HookFormParams>()
	return (
		<FormProvider {...form}>
			<Story />
		</FormProvider>
	)
}
export default {
	title: 'Data Portal/Fields/Phone Number Entry',
	component: PhoneNumberEntry,
	parameters: {
		msw: [fieldOpt.countries],
	},
} satisfies Meta<typeof PhoneNumberEntry>

type StoryDef = StoryObj<typeof PhoneNumberEntry>

export const Default = {
	decorators: [FormContextDecorator],
	render: function Render() {
		const form = useFormContext()

		return (
			<PhoneNumberEntry
				countrySelectProps={form.getInputProps('phoneCountryId')}
				phoneEntryProps={{
					...form.getInputProps('phoneNumber'),
					setError: (err) => form.setFieldError('phoneNumber', err),
				}}
			/>
		)
	},
} satisfies StoryDef

export const WithReactHookForm = {
	decorators: [HookFormContextDecorator],
	args: {
		countrySelectProps: { name: 'countryId' },
		phoneEntryProps: { name: 'number' },
	},
	render: function Render(args) {
		return <PhoneNumberEntryHookForm {...args} />
	},
} satisfies StoryObj<typeof PhoneNumberEntryHookForm>

type HookFormParams = { countryId: string; number: string }
