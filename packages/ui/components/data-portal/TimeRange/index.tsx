import { ActionIcon, Group, Input, type InputProps, Stack, Text, useMantineTheme } from '@mantine/core'
import { DateTime, Interval } from 'luxon'
import { useEffect, useState } from 'react'
import { type FieldValues, useController, type UseControllerProps, useFormContext } from 'react-hook-form'

import { useCustomVariant } from '~ui/hooks'
import { Icon } from '~ui/icon'

import { type DayIndex } from '../HoursDrawer/schema'

interface TimeRangeComponent extends Omit<InputProps, 'value'> {
	value?: string
	deleteHandler: () => void
	dayIndex: DayIndex
	key: string
}
export type HoursRangeProps<T extends FieldValues> = UseControllerProps<T> & TimeRangeComponent

const { weekYear, weekNumber } = DateTime.now()

export const TimeRange = <T extends FieldValues>({
	name,
	control,
	defaultValue,
	shouldUnregister,
	deleteHandler,
	disabled,
	rules,
	dayIndex,
	...props
}: HoursRangeProps<T>) => {
	const {
		field: { value, onChange, ref, ...field },
		fieldState,
	} = useController<T>({
		name,
		control,
		defaultValue,
		rules,
		shouldUnregister,
		disabled,
	})

	const form = useFormContext<T>()
	const variant = useCustomVariant()
	const theme = useMantineTheme()
	const interval = Interval.fromISO(value as string)
	const [openValue, setOpenValue] = useState(interval?.start?.toFormat('HH:mm'))
	const [closeValue, setCloseValue] = useState(interval?.end?.toFormat('HH:mm'))

	useEffect(() => {
		if (!openValue || !closeValue) return
		const start = DateTime.fromFormat(openValue, 'HH:mm').set({ weekYear, weekNumber, weekday: dayIndex })
		const end = DateTime.fromFormat(closeValue, 'HH:mm').set({ weekYear, weekNumber, weekday: dayIndex })

		const updatedValue = value
			? interval
					.set({
						start,
						end,
					})
					.toISO()
			: Interval.fromDateTimes(start, end).toISO()
		if (Interval.fromISO(updatedValue).isValid) {
			onChange(updatedValue)
		} else {
			onChange(null)
			form && form.setError(name, { message: 'Invalid time range' })
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [openValue, closeValue])

	return (
		<Stack>
			<Input.Wrapper ref={ref}>
				<Group noWrap>
					<Stack spacing={0}>
						<Text variant={variant.Text.utility1}>Open</Text>
						<Input
							type='time'
							value={openValue}
							// error={fieldState.error?.message}
							onChange={(e) => setOpenValue(e.target.value)}
							disabled={disabled}
							{...field}
							{...props}
						/>
					</Stack>
					<Stack spacing={0}>
						<Text variant={variant.Text.utility1}>Close</Text>
						<Input
							type='time'
							value={closeValue}
							// error={fieldState.error?.message}
							onChange={(e) => setCloseValue(e.target.value)}
							disabled={disabled}
							{...field}
							{...props}
						/>
					</Stack>
					<ActionIcon disabled={disabled}>
						<Icon
							icon='carbon:trash-can'
							onClick={deleteHandler}
							height={24}
							color={theme.other.colors.secondary.black}
						/>
					</ActionIcon>
				</Group>
				<Input.Error>{fieldState.error?.message}</Input.Error>
			</Input.Wrapper>
		</Stack>
	)
}
