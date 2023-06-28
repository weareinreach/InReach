import {
	Box,
	type ButtonProps,
	Checkbox,
	createPolymorphicComponent,
	createStyles,
	Divider,
	Drawer,
	Group,
	rem,
	Select,
	Stack,
	Text,
	Title,
	UnstyledButton,
} from '@mantine/core'
import { TimeInput } from '@mantine/dates'
import { zodResolver } from '@mantine/form'
import { useDebouncedValue, useDisclosure } from '@mantine/hooks'
import { DateTime, Interval } from 'luxon'
import { type ComponentPropsWithRef, forwardRef, useEffect, useState } from 'react'
import timezones from 'timezones-list'
import { z } from 'zod'

import { type ApiOutput } from '@weareinreach/api'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { HoursDrawerFormProvider, useForm } from './HoursDrawerContext'

const useStyles = createStyles((theme) => ({
	drawerContent: {
		borderRadius: `${rem(32)} 0 0 0`,
		minWidth: '40vw',
	},
	drawerBody: {
		padding: `${rem(40)} ${rem(32)}`,
		'&:not(:only-child)': {
			paddingTop: rem(40),
		},
	},
	addNewButton: {
		width: '100%',
		border: `${rem(1)} dashed ${theme.other.colors.secondary.teal}`,
		borderRadius: rem(8),
		padding: rem(12),
	},
	addNewText: {
		color: theme.other.colors.secondary.teal,
	},
}))

const FormSchema = z.object({
	data: z
		.object({
			dayIndex: z.coerce.number().nullable(),
			start: z.coerce.date().nullable(),
			end: z.coerce.date().nullable(),
			close: z.coerce.boolean().nullable(),
			tz: z.string().nullable(),
		})
		.partial(),
})

const schemaTransform = ({ id, data }: FormSchema) => ({
	id,
	data: {
		...data,
	},
})

const tzGroup = [
	'Pacific/Honolulu',
	'America/Anchorage',
	'America/Los_Angeles',
	'America/Denver',
	'America/Chicago',
	'America/New_York',
]

const timezoneData = timezones.map((item, index) => {
	const { tzCode, ...rest } = item
	return {
		...rest,
		key: index,
		value: tzCode,
		group: tzGroup.includes(tzCode) ? 'North America' : 'Other',
	}
})

//the mantine select grouping will set the group order based on the first group value it comes across
//adding this sort order so the "Most Common" group will appear first
const sortedTimezoneData = timezoneData.sort((a, b) => {
	if (a.group === 'North America' && b.group === 'Other') {
		return -1
	} else if (a.group === 'Other' && b.group === 'North America') {
		return 1
	}
	return 0
})

const _HoursDrawer = forwardRef<HTMLButtonElement, HoursDrawerProps>(({ locationId, ...props }, ref) => {
	const [opened, handler] = useDisclosure(false)
	const [isSaved, setIsSaved] = useState(false)
	const form = useForm<FormSchema>({
		validate: zodResolver(FormSchema),
		initialValues: { data: [] },
		transformValues: FormSchema.transform(schemaTransform).parse,
	})
	const [tzValue, setTzValue] = useState<string | null>(null)
	const { classes } = useStyles()
	const variants = useCustomVariant()
	const [checked, setChecked] = useState<{ [key: number]: boolean }>({
		0: false, // Sunday
		1: false, // Monday
		2: false, // Tuesday
		3: false, // Wednesday
		4: false, // Thursday
		5: false, // Friday
		6: false, // Saturday
	})
	const [timeValues, setTimeValues] = useState<{
		[key: number]: { start: Date | null; end: Date | null }
	}>({
		0: { start: null, end: null }, // Sunday
		1: { start: null, end: null }, // Monday
		2: { start: null, end: null }, // Tuesday
		3: { start: null, end: null }, // Wednesday
		4: { start: null, end: null }, // Thursday
		5: { start: null, end: null }, // Friday
		6: { start: null, end: null }, // Saturday
	})
	console.log(timeValues)
	const handleUpdate = () => {
		//TODO save to DB instead of sending to console.log
		const data = generateDataArray()
		console.log(data)
	}

	const TimeRangeComponent = (title: string, dayIndex: number) => {
		const [timeRangeGroups, setTimeRangeGroups] = useState<JSX.Element[]>([]) // Define the type for state variable

		const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
			const { checked } = event.currentTarget

			setChecked((prevChecked) => {
				if (checked) {
					setTimeRangeGroups([])
					setTimeValues((prevTimeValues) => ({
						...prevTimeValues,
						[dayIndex]: {
							start: DateTime.fromMillis(0).toUTC().toISO(), // Set start time to 1970-01-01T00:00:00.000Z
							end: DateTime.fromObject(
								{ year: 1970, month: 1, day: 1, hour: 23, minute: 59, second: 59, millisecond: 0 },
								{ zone: 'utc' }
							).toISO(), // Set end time to 1970-01-01T23:59:59.000Z
						},
					}))
				}

				return {
					...prevChecked,
					[dayIndex]: checked,
				}
			})
		}

		const handleAddTimeRangeGroup = () => {
			// Add a new time range group to the state
			setTimeRangeGroups((prevTimeRangeGroups) => [
				...prevTimeRangeGroups,
				<Group key={prevTimeRangeGroups.length}>
					<TimeInput
						label='Open time'
						ref={ref}
						maw={200}
						mx='auto'
						disabled={isCheckboxChecked}
						onChange={(event) => handleTimeChange(event, dayIndex, 'start')}
						name='start'
					/>
					<TimeInput
						label='Close time'
						ref={ref}
						maw={200}
						mx='auto'
						disabled={isCheckboxChecked}
						onChange={(event) => handleTimeChange(event, dayIndex, 'end')}
						name='end'
					/>
				</Group>,
			])
		}

		const handleTimeChange = (
			event: React.ChangeEvent<HTMLInputElement>,
			dayIndex: number,
			timeType: 'start' | 'end'
		) => {
			const { name, value } = event.currentTarget
			const [hours, minutes] = value.split(':')

			const date = new Date(1970, 0, 1, parseInt(hours, 10), parseInt(minutes, 10))

			setTimeValues((prevTimeValues) => ({
				...prevTimeValues,
				[dayIndex]: {
					...prevTimeValues[dayIndex],
					[name]: date,
				},
			}))
		}

		const isCheckboxChecked = checked[dayIndex]

		return (
			<Stack>
				<Group position='apart'>
					<Title order={3}>{title}</Title>
					<Checkbox checked={isCheckboxChecked} onChange={handleCheckboxChange} label='Open 24 Hours' />
				</Group>
				<Group>
					<TimeInput
						label='Open time'
						ref={ref}
						maw={200}
						mx='auto'
						disabled={isCheckboxChecked}
						onChange={(event) => handleTimeChange(event, dayIndex, 'start')}
						name='start'
					/>
					<TimeInput
						label='Close time'
						ref={ref}
						maw={200}
						mx='auto'
						disabled={isCheckboxChecked}
						onChange={(event) => handleTimeChange(event, dayIndex, 'end')}
						name='end'
					/>
				</Group>
				{timeRangeGroups} {/* Render the dynamically added HTML when button is clicked*/}
				<Button variant='secondary' onClick={handleAddTimeRangeGroup} disabled={isCheckboxChecked}>
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

	const convertTimeToUTC = (timeInput, timezone) => {
		return timeInput
	}

	const generateDataArray = () => {
		const dataArray = Object.entries(timeValues).map(([dayIndex, timeValue]) => {
			const start = timeValue.start ? convertTimeToUTC(timeValue.start, tzValue) : null
			const end = timeValue.end ? convertTimeToUTC(timeValue.end, tzValue) : null
			const closed = !start || !end
			const tz = tzValue || null

			return {
				dayIndex: parseInt(dayIndex),
				start,
				end,
				closed,
				tz,
			}
		})

		return dataArray
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
								value={tzValue}
								onChange={setTzValue}
								label='Select a timezone for this location'
								placeholder='Search for timezone'
								searchable
								nothingFound='No options'
								maxDropdownHeight={280}
								data={sortedTimezoneData}
							/>
							<Divider my='sm' />
						</Stack>
						{TimeRangeComponent('Sunday', 0)}
						{TimeRangeComponent('Monday', 1)}
						{TimeRangeComponent('Tuesday', 2)}
						{TimeRangeComponent('Wednesday', 3)}
						{TimeRangeComponent('Thursday', 4)}
						{TimeRangeComponent('Friday', 5)}
						{TimeRangeComponent('Saturday', 6)}
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

type FormSchema = z.infer<typeof FormSchema>
