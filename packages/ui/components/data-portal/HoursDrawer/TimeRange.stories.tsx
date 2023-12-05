import { action } from '@storybook/addon-actions'
import { type Meta, type StoryObj } from '@storybook/react'
import { type ComponentProps } from 'react'
import { Form, useForm } from 'react-hook-form'

import { createInterval } from '~ui/mockData/orgHours'

import { TimeRange } from './TimeRange'

const Wrapped = (props: ComponentProps<typeof TimeRange>) => {
	const { control, watch } = useForm({ mode: 'all' })

	return (
		<div style={{ height: '100%' }}>
			<div style={{ width: 'fit-content', margin: '0 auto' }}>
				<Form control={control}>
					<TimeRange control={control} {...props} />
				</Form>
			</div>

			<div>Value: {watch('date')?.toString()}</div>
		</div>
	)
}
export default {
	title: 'Data Portal/Fields/Time Range',
	component: TimeRange,
	render: Wrapped,
	parameters: {
		layoutWrapper: 'centeredFullscreen',
		layout: 'fullscreen',
	},
	args: {
		defaultValue: createInterval('08:00', '17:00', 0, 'America/New_York'),
		deleteHandler: action('delete interval'),
		name: 'date',
	},
} satisfies Meta<typeof TimeRange>

type StoryDef = StoryObj<typeof TimeRange>

export const Primary: StoryDef = {}
