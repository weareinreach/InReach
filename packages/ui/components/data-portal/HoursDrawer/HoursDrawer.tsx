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
import { Form, useForm, zodResolver } from '@mantine/form'
import { useDebouncedValue, useDisclosure, useListState } from '@mantine/hooks'
import { DateTime, Interval } from 'luxon'
import { type ComponentPropsWithRef, forwardRef, type ReactNode, useEffect, useMemo, useState } from 'react'
import timezones from 'timezones-list'
import { z } from 'zod'

import { type ApiOutput } from '@weareinreach/api'
import { generateId } from '@weareinreach/db/lib/idGen'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

// import { HoursDrawerFormProvider, useForm } from './HoursDrawerContext'

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

const FormSchema = z
	.object({
		data: z
			.object({
				id: z.string().optional(),
				dayIndex: z.coerce.number(),
				start: z
					.string({ required_error: 'Start time is required', invalid_type_error: 'Invalid entry' })
					.length(5),
				end: z
					.string({ required_error: 'End time is required', invalid_type_error: 'Invalid entry' })
					.length(5),
				closed: z.coerce.boolean(),
				tz: z.string().nullable(),
				delete: z.boolean().optional(),
			})
			.array(),
	})
	.superRefine((val, ctx) => {
		// https://zod.dev/?id=superrefine
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
	const [opened, handler] = useDisclosure(true) //TODO: Change back to 'false' when done.
	const [isSaved, setIsSaved] = useState(false)
	const form = useForm<z.infer<typeof FormSchema>>({
		validate: zodResolver(FormSchema),
		initialValues: {
			data: [],
		},
	})
	const [tzValue, setTzValue] = useState<string | null>(null)
	const { classes } = useStyles()
	const variants = useCustomVariant()

	/** Remove this */
	const [checked, setChecked] = useState<{ [key: number]: boolean }>({
		0: false, // Sunday
		1: false, // Monday
		2: false, // Tuesday
		3: false, // Wednesday
		4: false, // Thursday
		5: false, // Friday
		6: false, // Saturday
	})
	/** Remove this */
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

	//data comes back here
	const { data: initialData } = api.orgHours.forHoursDrawer.useQuery(locationId ?? '', {
		onSuccess: (data) => form.setValues({ data }),
	})
	console.log('form values', form.values)

	// Docs: https://mantine.dev/form/nested/

	const handleUpdate = () => {
		//TODO save to DB instead of sending to console.log
		// const data = generateDataArray()
		console.log('clicked save', form.isValid(), form.errors)
	}

	const TimeRangeComponent = ({ arrayIdx }: { arrayIdx: number }) => {
		return (
			<Stack>
				<Group>
					<TimeInput
						label='Open time'
						maw={200}
						mx='auto'
						name='start'
						{...form.getInputProps(`data.${arrayIdx}.start`)}
						onFocus={undefined}
					/>
					<TimeInput
						label='Close time'
						maw={200}
						mx='auto'
						name='end'
						{...form.getInputProps(`data.${arrayIdx}.end`)}
						onFocus={undefined}
					/>
				</Group>
				<Button onClick={() => form.setFieldValue(`data.${arrayIdx}.delete`, true)}>Delete</Button>
			</Stack>
		)
	}
	const DayWrap = ({ dayIndex, children }: { dayIndex: number; children: ReactNode }) => {
		const days = {
			0: 'Sunday',
			1: 'Monday',
			2: 'Tuesday',
			3: 'Wednesday',
			4: 'Thursday',
			5: 'Friday',
			6: 'Saturday',
		}

		return (
			<Stack>
				<Group position='apart'>
					<Title order={3}>{days[dayIndex.toString()] ?? ''}</Title>
					<Checkbox label='Open 24 Hours' />
				</Group>
				{children}
				<Button
					variant='secondary'
					onClick={() =>
						form.insertListItem('data', {
							dayIndex,
							closed: false,
							id: generateId('orgHours'),
							start: '',
							end: '',
						})
					}
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

	const dayRender: Record<string, JSX.Element[]> = {
		0: [],
		1: [],
		2: [],
		3: [],
		4: [],
		5: [],
		6: [],
	}

	form.values.data.forEach((item, idx) => {
		if (item.delete || !dayRender[item.dayIndex.toString()]) return
		dayRender[item.dayIndex.toString()]?.push(<TimeRangeComponent arrayIdx={idx} key={item.id ?? idx} />)
	})

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
						<form>
							{Object.entries(dayRender).map(([dayIndex, children]) => (
								<DayWrap key={dayIndex} dayIndex={parseInt(dayIndex)}>
									{children}
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

type FormSchema = z.infer<typeof FormSchema>
