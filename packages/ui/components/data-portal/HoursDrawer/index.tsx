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
import { DateTime, Interval } from 'luxon'
import { forwardRef, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { Checkbox, Select } from 'react-hook-form-mantine'
import timezones from 'timezones-list'
import { type z } from 'zod'
// import { compareObjectVals } from 'crud-object-diff'

import { generateId } from '@weareinreach/db/lib/idGen'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { TimeRange } from '~ui/components/data-portal/TimeRange'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { defaultInterval, updateClosed, updateOpen24, updateTz, useDayFieldArray } from './fieldArray'
import { type DayIndex, dayIndicies, FormSchema, type ZFormSchema } from './schema'
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
	//data comes from api here
	const { data: initialData } = api.orgHours.forHoursDrawer.useQuery(locationId ?? '')
	const utils = api.useUtils()

	const form = useForm<ZFormSchema>({
		resolver: zodResolver(FormSchema),
		defaultValues: async () => {
			const data = await utils.orgHours.forHoursDrawer.fetch(locationId ?? '')
			const closed: ZFormSchema['closed'] = Object.fromEntries(
				dayIndicies.map((i) => [i, data[i]?.some((d) => d.closed) ?? false])
			)
			const open24hours: ZFormSchema['open24hours'] = Object.fromEntries(
				dayIndicies.map((i) => [i, data[i]?.some((d) => d.open24hours) ?? false])
			)
			const tz: ZFormSchema['tz'] = ''

			return {
				...data,
				closed,
				open24hours,
				tz,
			}
		},
	})
	const dayFields = useDayFieldArray(form.control)

	const [tzValue, setTzValue] = useState<string | null>(null)
	const { classes } = useStyles()
	const variants = useCustomVariant()

	const handleTimezoneChange = (selectedTzValue: string) => {
		// Update the tz value for all items in the form data based on the dropdown selection
		// const updatedFormData = form.values.data.map((item) => ({
		// 	...item,
		// 	tz: selectedTzValue,
		// }))
		// // Update form values with the updated tz values
		// form.setValues({ data: updatedFormData })
	}

	const handleUpdate = () => {
		//TODO save to DB instead of sending to console.log
		console.log('clicked save', form.getValues(), form.formState.errors)
	}

	const DayWrap = ({ dayIndex, children }: { dayIndex: DayIndex; children: React.ReactNode }) => {
		const specificDayIndex = dayIndex // Set the specific day index

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
					// disabled={checked && dayIndex === specificDayIndex}
				>
					<Group noWrap spacing={8}>
						<Icon icon='carbon:add' className={classes.addNewText} height={24} />
						<Text variant={variants.Text.utility2} className={classes.addNewText}>
							{' '}
							Add time range
						</Text>
					</Group>
				</Button>
				<Divider my='sm' />
			</Stack>
		)
	}

	// form.values.data.forEach((item, idx) => {
	// 	if (item.delete || !dayRender[item.dayIndex.toString()]) return

	// 	dayRender[item.dayIndex.toString()]?.push(
	// 		<TimeRangeComponent arrayIdx={idx} key={item.id ?? idx} open24={item.open24} />
	// 	)
	// })

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
						<form>
							{dayIndicies.map((day) => (
								<DayWrap dayIndex={day} key={day}>
									{dayFields[day]?.fields.map((item, idx) => {
										return <TimeRange key={item.id} name={`${day}.${idx}`} deleteHandler={() => {}} />
									})}
								</DayWrap>
							))}
						</form>
					</Drawer.Body>
				</Drawer.Content>
			</Drawer.Root>

			<Stack>
				<Box component='button' onClick={handler.open} ref={ref} {...props} />
			</Stack>
		</>
	)
})
_HoursDrawer.displayName = 'HoursDrawer'
export const HoursDrawer = createPolymorphicComponent<'button', HoursDrawerProps>(_HoursDrawer)

interface HoursDrawerProps extends ButtonProps {
	locationId?: string
}
