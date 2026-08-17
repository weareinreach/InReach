import { type Meta, type StoryObj } from '@storybook/nextjs'
import { type Interval } from 'luxon'
import { type ComponentProps } from 'react'
import { Form, useForm } from 'react-hook-form'
import { action } from 'storybook/actions'

import { createInterval } from '~ui/mockData/orgHours'

import { TimeRange } from '.'

const Wrapped = (props: ComponentProps<typeof TimeRange>) => {
	const { control, watch } = useForm<{ date: Interval<true> }>({ mode: 'all' })

	return (
		<div style={{ height: '100%' }}>
			<div style={{ width: 'fit-content', margin: '0 auto' }}>
				<Form control={control}>
					{/* @ts-expect-error ignore */}
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
		// This story never passed dayIndex - it's a required prop, so convertToLuxonWeekday(undefined)
		// returned NaN, which luxon's DateTime#set({ weekday: NaN }) rejects.
		dayIndex: 0,
	},
} satisfies Meta<typeof TimeRange>

type StoryDef = StoryObj<typeof TimeRange>

export const Primary: StoryDef = {}
