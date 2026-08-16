import { DevTool } from '@hookform/devtools'
import { type Meta, type StoryObj } from '@storybook/nextjs'
import { type FieldValues, useForm } from 'react-hook-form'

import { component } from '~ui/mockData/component'

import { ServiceSelect, type ServiceSelectProps } from './index'

const StoryRender = <T extends FieldValues>(args: ServiceSelectProps<T>) => {
	const form = useForm<T>()

	return (
		<>
			<ServiceSelect {...args} control={form.control}>
				Open Drawer
			</ServiceSelect>
			<DevTool control={form.control} placement='top-left' />
		</>
	)
}

export default {
	title: 'Data Portal/Drawers/Service Selection',
	component: ServiceSelect,

	beforeEach({ msw }) {
		msw.use(component.ServiceSelect)
	},

	parameters: {
		layout: 'fullscreen',
		rqDevtools: true,
	},

	args: {
		name: 'services',
	},

	render: StoryRender,
} satisfies Meta<typeof ServiceSelect>

type StoryDef = StoryObj<typeof ServiceSelect>

export const Default = {} satisfies StoryDef
