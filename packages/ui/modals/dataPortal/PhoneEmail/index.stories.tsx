import { type Meta, type StoryObj } from '@storybook/react'

import { Button } from '~ui/components/core'
import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { allFieldOptHandlers } from '~ui/mockData/fieldOpt'

import { formHookParams, PhoneEmailFormProvider, useForm } from './context'
import { PhoneNumberEntry } from './fields'
import { PhoneEmailModal } from './index'

const FieldRender = () => {
	const form = useForm(formHookParams)
	return (
		<PhoneEmailFormProvider form={form}>
			<PhoneNumberEntry />
		</PhoneEmailFormProvider>
	)
}

export default {
	title: 'Data Portal/Modals/Add Phone or Email',
	component: PhoneEmailModal,
	parameters: {
		layout: 'fullscreen',
		layoutWrapper: 'centeredHalf',
		msw: [...allFieldOptHandlers],
		rqDevtools: true,
	},
	args: {
		component: Button,
		children: 'Open Modal',
		variant: 'inlineInvertedUtil1',
	},
} satisfies Meta<typeof PhoneEmailModal>
type StoryDef = StoryObj<typeof PhoneEmailModal>

export const Modal = {} satisfies StoryDef

export const Fields = {
	render: FieldRender,
} satisfies StoryObj<typeof FieldRender>
