import { zodResolver } from '@hookform/resolvers/zod'
import {
	Box,
	type ButtonProps,
	Checkbox,
	createPolymorphicComponent,
	Divider,
	Drawer,
	Group,
	Select,
	Stack,
	Text,
	Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { DateTime, Interval } from 'luxon'
import { forwardRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { TimeInput } from 'react-hook-form-mantine'
import timezones from 'timezones-list'
import { type z } from 'zod'

import { generateId } from '@weareinreach/db/lib/idGen'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { useDayFieldArray } from './fieldArray'
import { FormSchema } from './schema'
import { useStyles } from './styles'

const tzGroup = new Set([
	'Pacific/Honolulu',
	'America/Anchorage',
	'America/Los_Angeles',
	'America/Denver',
	'America/Chicago',
	'America/New_York',
])

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

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: async () => await utils.orgHours.forHoursDrawer.fetch(locationId ?? ''),
	})
	const [tzValue, setTzValue] = useState<string | null>(null)
	const { classes } = useStyles()
	const variants = useCustomVariant()

	// Initialize the array of checked states with false for each day
	const [checkedStates, setCheckedStates] = useState<boolean[]>([
		false,
		false,
		false,
		false,
		false,
		false,
		false,
	])

	//check for time segment overlaps
	const findOverlappingDayIndexes = (data: z.infer<typeof FormSchema>['data']): number[] => {
		const overlappingDayIndexes: number[] = []

		for (let i = 0; i < data.length; i++) {
			const currentItem = data[i]

			// Skip if currentItem is undefined, an emtpy string, or if open24 is true, or if item is already marked as overlapping
			if (!currentItem || currentItem.open24 || overlappingDayIndexes.includes(currentItem.dayIndex)) {
				continue
			}

			const overlappingRanges = data.filter(
				(item) =>
					item.dayIndex === currentItem.dayIndex &&
					!item.open24 &&
					currentItem.start !== '' &&
					currentItem.end !== '' &&
					item.start !== '' &&
					item.end !== '' &&
					rangesOverlap([currentItem.start, currentItem.end], [item.start, item.end])
			)

			if (overlappingRanges.length > 1) {
				console.log('day index is overlapping', currentItem.dayIndex)
				overlappingDayIndexes.push(currentItem.dayIndex)
			}
		}

		return overlappingDayIndexes
	}

	const rangesOverlap = (rangeA: string[], rangeB: string[]) => {
		const [startA = '', endA = ''] = rangeA
		const [startB = '', endB = ''] = rangeB

		const startADateTime = DateTime.fromFormat(startA, 'HH:mm')
		const endADateTime = DateTime.fromFormat(endA, 'HH:mm')
		const startBDateTime = DateTime.fromFormat(startB, 'HH:mm')
		const endBDateTime = DateTime.fromFormat(endB, 'HH:mm')

		return !(endADateTime <= startBDateTime || endBDateTime <= startADateTime)
	}

	console.log(findOverlappingDayIndexes(form.values.data))

	// Function to handle checkbox change for a specific day
	const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, dayIndex: number) => {
		const { checked } = event.currentTarget
		// Create a new array with the updated checked state for the specific day
		const newCheckedStates = [...checkedStates]
		newCheckedStates[dayIndex] = checked
		setCheckedStates(newCheckedStates)

		// Check if there is a pre-existing time segment with the same dayIndex
		const existingItemIndex = form.values.data.findIndex((item) => item.dayIndex === dayIndex && !item.new)

		// Check if there are items with the same dayIndex and open24: true
		//we dont want to add a time segment if one already exists
		const existingOpen24ItemIndex = form.values.data.findIndex(
			(item) => item.dayIndex === dayIndex && item.open24 === true
		)

		// Remove items with the same dayIndex and new: true
		// This is because they were added and not saved before more changes were made
		// to the form data and we don't want to have competing update and delete events
		const newDataWithoutNew = form.values.data.filter(
			(item) => !(item.dayIndex === dayIndex && item.new === true)
		)

		// Update the form data based on the checkbox state and other conditions
		if (checked) {
			if (existingItemIndex > -1) {
				// An item exists which matches the dayIndex, let's update that item
				const newData = form.values.data.map((item, index) => {
					if (item.dayIndex === dayIndex) {
						if (index === existingItemIndex) {
							// Update start, end, and open24 for the first matching item
							// and remove the delete property if it's true
							const { delete: propToDelete, ...updatedObject } = item
							return {
								...updatedObject,
								open24: true,
								start: '00:00',
								end: '00:00',
							}
						} else {
							// Set delete: true for other matching items
							return { ...item, delete: true }
						}
					} else {
						return item // No changes for other items
					}
				})
				form.setValues({ data: newData })
			} else if (existingOpen24ItemIndex === -1 || newDataWithoutNew.length === 0) {
				//if there are no pre-existing segments and no 'new' segments, add a new item with open24: true
				const newData = [
					...newDataWithoutNew,
					{
						start: '00:00',
						end: '00:00',
						id: generateId('orgHours'),
						dayIndex,
						closed: false,
						open24: true,
					},
				]
				form.setValues({ data: newData })
			}
		} else {
			// If checkbox is unchecked, remove open24 property if it exists
			const newDataWithoutOpen24 = newDataWithoutNew.map((item) => {
				if (item.dayIndex === dayIndex && item.open24) {
					const { open24, ...newItem } = item
					return { ...newItem, new: true }
				}
				return item
			})

			// Update the form data without the open24 property
			form.setValues({ data: newDataWithoutOpen24 })
		}
	}

	const handleTimezoneChange = (selectedTzValue: string) => {
		// Update the tz value for all items in the form data based on the dropdown selection
		const updatedFormData = form.values.data.map((item) => ({
			...item,
			tz: selectedTzValue,
		}))

		// Update form values with the updated tz values
		form.setValues({ data: updatedFormData })
	}

	const handleUpdate = () => {
		//TODO save to DB instead of sending to console.log
		console.log('clicked save', form.isValid(), form.errors, form.values)
	}

	const TimeRangeComponent = ({ arrayIdx, open24 }: { arrayIdx: number; open24?: boolean }) => {
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
						disabled={open24}
					/>
					<TimeInput
						label='Close time'
						maw={200}
						mx='auto'
						name='end'
						{...form.getInputProps(`data.${arrayIdx}.end`)}
						onFocus={undefined}
						disabled={open24}
					/>
					<Icon
						icon='carbon:trash-can'
						onClick={() => {
							if (form.values.data[arrayIdx].new) {
								// Delete the item if new: true is set
								const newData = form.values.data.filter((_, idx) => idx !== arrayIdx)
								form.setValues({ data: newData })
							} else {
								// item not new so set delete flag to true
								const newData = form.values.data.map((item, idx) =>
									idx === arrayIdx ? { ...item, delete: true } : item
								)
								form.setValues({ data: newData })
							}
						}}
						style={{
							cursor: form.values.data[arrayIdx]?.open24 ? 'not-allowed' : 'pointer',
							opacity: form.values.data[arrayIdx].open24 ? 0.5 : 1, // Adjust opacity for the disabled look
						}}
					/>
				</Group>
			</Stack>
		)
	}
	const DayWrap = ({
		dayIndex,
		checked,
		onCheckboxChange,
		children,
	}: {
		dayIndex: number
		checked: boolean
		children: React.ReactNode
	}) => {
		const specificDayIndex = dayIndex // Set the specific day index

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
					<Checkbox
						label='Open 24 Hours'
						checked={checked}
						onChange={(event) => onCheckboxChange(event, dayIndex)}
					/>
				</Group>
				{children}
				<Button
					variant='secondary'
					onClick={() =>
						form.insertListItem('data', {
							start: '',
							end: '',
							id: generateId('orgHours'),
							dayIndex,
							closed: false,
							new: true,
						})
					}
					disabled={checked && dayIndex === specificDayIndex}
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

		dayRender[item.dayIndex.toString()]?.push(
			<TimeRangeComponent arrayIdx={idx} key={item.id ?? idx} open24={item.open24} />
		)
	})

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
								onChange={(selectedTzValue) => {
									setTzValue(selectedTzValue)
									handleTimezoneChange(selectedTzValue)
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
							{Object.entries(dayRender).map(([dayIndex, children]) => (
								<DayWrap
									key={dayIndex}
									dayIndex={parseInt(dayIndex)}
									checked={checkedStates[parseInt(dayIndex)]}
									onCheckboxChange={(event) => handleCheckboxChange(event, parseInt(dayIndex))}
								>
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
