import { type Meta, type StoryFn, type StoryObj } from '@storybook/react'

import { fieldOptHandlers } from '~ui/mockData/fieldOpt'
import {
	formHookParams,
	PhoneEmailFormProvider,
	useForm,
	useFormContext,
} from '~ui/modals/dataPortal/PhoneEmail/context'

import { PhoneNumberEntry } from './PhoneNumberEntry'

const FormContextDecorator = (Story: StoryFn) => {
	const form = useForm(formHookParams)
	return (
		<PhoneEmailFormProvider form={form}>
			<Story />
		</PhoneEmailFormProvider>
	)
}
export default {
	title: 'Data Portal/Fields/Phone Number Entry',
	component: PhoneNumberEntry,
	parameters: {
		msw: [fieldOptHandlers.countries],
	},
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
} satisfies Meta<typeof PhoneNumberEntry>

type StoryDef = StoryObj<typeof PhoneNumberEntry>

export const Default = {} satisfies StoryDef
