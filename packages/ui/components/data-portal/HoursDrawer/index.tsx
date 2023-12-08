import { DevTool } from '@hookform/devtools'
import { zodResolver } from '@hookform/resolvers/zod'
import {
	Box,
	type ButtonProps,
	createPolymorphicComponent,
	Divider,
	Drawer,
	Group,
	Stack,
	Text,
	Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
// import { DateTime, Interval } from 'luxon'
import { compareObjectVals } from 'crud-object-diff'
import { forwardRef, useMemo, useState } from 'react'
import { Form, useForm } from 'react-hook-form'
import { Checkbox, Select } from 'react-hook-form-mantine'
import timezones from 'timezones-list'

import { generateId } from '@weareinreach/db/lib/idGen'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { TimeRange } from '~ui/components/data-portal/TimeRange'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { defaultInterval, updateClosed, updateOpen24, updateTz, useDayFieldArray } from './fieldArray'
import {
	type DayIndex,
	dayIndicies,
	FormSchema,
	getDayRecords,
	isDayKey,
	type ZFormSchema,
	type ZHourRecord,
} from './schema'
import { useStyles } from './styles'

const tzGroup = new Set([
	'Pacific/Honolulu',
	'America/Anchorage',
	'America/Los_Angeles',
	'America/Denver',
	'America/Chicago',
	'America/New_York',
])
const days = {
	'0': 'Sunday',
	'1': 'Monday',
	'2': 'Tuesday',
	'3': 'Wednesday',
	'4': 'Thursday',
	'5': 'Friday',
	'6': 'Saturday',
} as const

const timezoneData = timezones.map((item, index) => {
	const { tzCode, ...rest } = item
	return {
		...rest,
		key: index,
		value: tzCode,
		group: tzGroup.has(tzCode) ? 'North America' : 'Other',
	}
})

const sortedTimezoneData = timezoneData.sort((a, b) => {
	if (a.group === 'North America' && b.group === 'Other') {
		return -1
	} else if (a.group === 'Other' && b.group === 'North America') {
		return 1
	}
	return 0
})

const _HoursDrawer = forwardRef<HTMLButtonElement, HoursDrawerProps>(({ locationId, ...props }, ref) => {
	const [opened, handler] = useDisclosure(true) //TODO: Change back to 'false' when done.
	const [isSaved, setIsSaved] = useState(false)
	// const [initialData, setInitialData] = useState<ZFormSchema | null>(null)
	//data comes from api here
	const { data: initialData } = api.orgHours.forHoursDrawer.useQuery(locationId ?? '')
	const utils = api.useUtils()

	const form = useForm<ZFormSchema>({
		resolver: zodResolver(FormSchema),
		defaultValues: async () => {
			const data = await utils.orgHours.forHoursDrawer.fetch(locationId ?? '')
			// setInitialData(data)
			return data
		},
		mode: 'all',
	})

	const dayFields = useDayFieldArray(form.control)

	const { classes } = useStyles()
	const variants = useCustomVariant()

	console.log(form)

	const handleUpdate = () => {
		//TODO save to DB instead of sending to console.log
		if (!initialData) {
			throw new Error('Missing initial data')
		}
		const initial = getDayRecords(initialData)
		const current = getDayRecords(form.getValues())
		console.log(initial, current)
		const diffed = compareObjectVals([initial, current], 'id')

		console.log('clicked save', diffed, form.formState.errors)
	}

	const DayWrap = ({ dayIndex, children }: { dayIndex: DayIndex; children: React.ReactNode }) => {
		const checkboxStates = form.watch([`open24hours.${dayIndex}`, `closed.${dayIndex}`])
		const shouldDisable = useMemo(
			() => checkboxStates.reduce((prev, curr) => (curr ? curr : prev), false),
			[checkboxStates]
		)

		return (
			<Stack>
				<Group position='apart'>
					<Title order={3}>{days[dayIndex] ?? ''}</Title>
					<Checkbox
						control={form.control}
						label='Open 24 Hours'
						name={`open24hours.${dayIndex}`}
						onChange={(event) =>
							updateOpen24({
								form,
								dayFields,
								dayIndex: `${dayIndex}`,
								newValue: event.target.checked,
							})
						}
					/>
					<Checkbox
						control={form.control}
						label='Closed'
						name={`closed.${dayIndex}`}
						onChange={(event) =>
							updateClosed({
								form,
								dayFields,
								dayIndex: `${dayIndex}`,
								newValue: event.target.checked,
							})
						}
					/>
				</Group>
				{children}
				<Button
					variant='secondary'
					onClick={() =>
						dayFields[dayIndex].append({
							closed: false,
							open24hours: false,
							tz: form.getValues().tz,
							dayIndex: parseInt(dayIndex),
							id: generateId('orgHours'),
							interval: defaultInterval(form.getValues().tz),
						})
					}
					disabled={shouldDisable}
				>
					<Group noWrap spacing={8}>
						<Icon icon='carbon:add' className={classes.addNewText} height={24} />
						<Text variant={variants.Text.utility2} className={classes.addNewText}>
							Add time range
						</Text>
					</Group>
				</Button>
				<Divider my='sm' />
			</Stack>
		)
	}

	return (
		<>
			<Drawer.Root onClose={handler.close} opened={opened} position='right'>
				<Drawer.Overlay />
				<Drawer.Content className={classes.drawerContent}>
					<Drawer.Header>
						<Group noWrap position='apart' w='100%'>
							<Breadcrumb option='close' onClick={handler.close} />
							<Button
								variant='primary-icon'
								leftIcon={<Icon icon={isSaved ? 'carbon:checkmark' : 'carbon:save'} />}
								onClick={handleUpdate}
							>
								Save
							</Button>
						</Group>
					</Drawer.Header>
					<Drawer.Body className={classes.drawerBody}>
						<Stack spacing={24} align='center'>
							<Title order={2}>Hours</Title>
							<Select
								control={form.control}
								name='tz'
								onChange={(newValue) => {
									newValue && updateTz({ form, newValue })
								}}
								label='Select a timezone for this location'
								placeholder='Search for timezone'
								searchable
								nothingFound='No options'
								maxDropdownHeight={280}
								data={sortedTimezoneData}
							/>
							<Divider my='sm' />
						</Stack>

						{dayIndicies.map((day) => (
							<DayWrap dayIndex={day} key={day}>
								{dayFields[day]?.fields.map((item, idx) => {
									return (
										<TimeRange
											key={item.id}
											name={`${day}.${idx}.interval`}
											deleteHandler={() => {
												dayFields[day].remove(idx)
											}}
											control={form.control}
										/>
									)
								})}
							</DayWrap>
						))}
					</Drawer.Body>
				</Drawer.Content>
			</Drawer.Root>

			<Stack>
				<Box component='button' onClick={handler.open} ref={ref} {...props} />
			</Stack>
			<DevTool control={form.control} />
		</>
	)
})
_HoursDrawer.displayName = 'HoursDrawer'
_HoursDrawer.whyDidYouRender = {
	trackExtraHooks: [[require('react-hook-form'), 'useFieldArray']],
}
export const HoursDrawer = createPolymorphicComponent<'button', HoursDrawerProps>(_HoursDrawer)

interface HoursDrawerProps extends ButtonProps {
	locationId?: string
}
