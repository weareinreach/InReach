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
// import { DateTime, Interval } from 'luxon'
import { compareObjectVals } from 'crud-object-diff'
import groupBy from 'just-group-by'
import { forwardRef, useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import timezones from 'timezones-list'

import { generateId } from '@weareinreach/db/lib/idGen'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { TimeRange } from '~ui/components/data-portal/TimeRange'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { defaultInterval, updateClosed, updateOpen24, updateTz } from './fieldArray'
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
	const [opened, handler] = useDisclosure(false)
	const [isSaved, setIsSaved] = useState(false)
	const [globalTz, setGlobalTz] = useState<string | null>(null)
	// const [initialData, setInitialData] = useState<ZFormSchema | null>(null)
	//data comes from api here
	const { data: initialData } = api.orgHours.forHoursDrawer.useQuery(locationId ?? '', {
		select: (data) => ({ data }),
	})
	const utils = api.useUtils()
	const mutationApi = api.orgHours.processDrawer.useMutation({
		onSuccess: () => utils.orgHours.forHoursDrawer.invalidate(locationId),
	})

	const form = useForm<ZFormSchema>({
		resolver: zodResolver(FormSchema),
		defaultValues: async () => {
			const data = await utils.orgHours.forHoursDrawer.fetch(locationId ?? '')
			return { data }
		},
		// mode: 'all',
	})
	const hoursObjects = useFieldArray({ control: form.control, name: 'data', keyName: 'id' })
	const formData = form.getValues('data') ?? []
	const groupedData = () => {
		if (!formData) return
		const grouped = groupBy(
			formData.map((item, idx) => ({ ...item, idx })),
			({ dayIndex }) => dayIndex
		)
		return new Map(Object.entries(grouped).map(([key, val]) => [Number(key), val]))
	}

	const tzMap = new Map<string, number>()
	useEffect(() => {
		if (!globalTz && Array.isArray(formData) && formData.length) {
			for (const { tz } of formData) {
				if (tzMap.has(tz)) {
					tzMap.set(tz, tzMap.get(tz)! + 1)
				} else {
					tzMap.set(tz, 1)
				}
			}

			const tzObj = Object.fromEntries(tzMap.entries())
			const tzToSet = Object.keys(tzObj).reduce((a, b) => ((tzObj[a] ?? 0) > (tzObj[b] ?? 0) ? a : b))
			setGlobalTz(tzToSet)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [formData])

	const { classes } = useStyles()
	const variants = useCustomVariant()

	const handleUpdate = () => {
		form.trigger()
		if (!initialData) {
			throw new Error('Missing initial data')
		}
		const initial = initialData.data
		const current = form.getValues().data
		const diffed = compareObjectVals([initial, current], 'id')
		// TODO: Double check validation
		mutationApi.mutate(diffed)
	}

	const DayWrap = ({ dayIndex }: { dayIndex: DayIndex }) => {
		const items = groupedData()?.get(dayIndex) ?? []
		const [isClosed, setIsClosed] = useState(items.some((item) => item.closed && item.dayIndex === dayIndex))
		const [isOpen24Hours, setIsOpen24Hours] = useState(
			items.some((item) => item.open24hours && item.dayIndex === dayIndex)
		)
		const shouldDisable = isClosed || isOpen24Hours
		return (
			<Stack>
				<Group position='apart'>
					<Title order={3}>{days[dayIndex] ?? ''}</Title>
					<Checkbox
						label='Open 24 Hours'
						checked={isOpen24Hours}
						onChange={(event) => {
							updateOpen24({
								form,
								formData,
								dayIndex,
								newValue: event.target.checked,
							})
							setIsOpen24Hours(event.target.checked)
						}}
						disabled={isClosed}
					/>
					<Checkbox
						label='Closed'
						checked={isClosed}
						onChange={(event) => {
							updateClosed({
								form,
								formData,
								dayIndex,
								newValue: event.target.checked,
							})
							setIsClosed(event.target.checked)
						}}
						disabled={isOpen24Hours}
					/>
				</Group>
				{items?.map((item) => {
					return (
						<TimeRange
							key={item.id}
							name={`data.${item.idx}.interval`}
							deleteHandler={() => {
								hoursObjects.remove(item.idx)
							}}
							control={form.control}
							disabled={shouldDisable}
							dayIndex={dayIndex}
						/>
					)
				})}
				<Button
					variant='secondary'
					onClick={() =>
						hoursObjects.append({
							closed: false,
							open24hours: false,
							tz: globalTz ?? 'America/New_York',
							dayIndex,
							id: generateId('orgHours'),
							interval: defaultInterval(globalTz),
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
			<Drawer.Root
				onClose={handler.close}
				opened={opened}
				position='right'
				zIndex={10001}
				keepMounted={false}
			>
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
								onChange={(newValue) => {
									newValue && updateTz({ form, newValue, formData })
									setGlobalTz(newValue)
								}}
								value={globalTz}
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
							<DayWrap dayIndex={day} key={day} />
						))}
					</Drawer.Body>
				</Drawer.Content>
			</Drawer.Root>

			<Stack>
				<Box component='button' onClick={handler.open} ref={ref} className={classes.overlay} {...props} />
			</Stack>
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
