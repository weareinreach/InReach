import { ActionIcon, Group, Input, type InputProps, Stack, Text, useMantineTheme } from '@mantine/core'
import { DateTime, Interval } from 'luxon'
import { useEffect, useState } from 'react'
import { type FieldValues, useController, type UseControllerProps, useFormContext } from 'react-hook-form'

import { type DayIndex, type ZFormSchema } from '~ui/components/data-portal/HoursDrawer/schema'
import { useCustomVariant } from '~ui/hooks'
import { Icon } from '~ui/icon'

interface TimeRangeComponent extends Omit<InputProps, 'value'> {
	value?: string
	deleteHandler: () => void
	dayIndex: DayIndex
}
export type HoursRangeProps<T extends FieldValues = ZFormSchema> = UseControllerProps<T> & TimeRangeComponent

const { weekYear, weekNumber } = DateTime.now()

const validateIntervals = <T extends ZFormSchema>(
	currentVal: string,
	fieldValues: T,
	dayIndex: DayIndex,
	itemId: string
) => {
	if (!Interval.isInterval(Interval.fromISO(currentVal))) {
		return 'Invalid times'
	}

	console.log(`🚀 ~ file: index.tsx:26 ~ itemId:`, itemId)

	const itemsToCheck = fieldValues.data.filter(
		(record) => record.dayIndex === dayIndex && record.id !== itemId
	)

	console.log(`🚀 ~ file: index.tsx:29 ~ itemsToCheck:`, itemsToCheck)

	if (itemsToCheck.length > 1) {
		const intervalToValidate = Interval.fromISO(currentVal)

		console.log(`🚀 ~ file: index.tsx:34 ~ intervalToValidate:`, intervalToValidate)

		itemsToCheck.every(({ interval }) => {
			const intervalToCheck = Interval.fromISO(interval)
			const isValid = !intervalToValidate.overlaps(intervalToCheck)
			return isValid ? true : 'Opening times for the same day cannot overlap!'
		})
	}
	return true
}

export const TimeRange = <T extends FieldValues = ZFormSchema>({
	name,
	control,
	defaultValue,
	shouldUnregister,
	deleteHandler,
	disabled,
	rules: _rules,
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
		rules: {
			validate: (val: string, formVals) => validateIntervals(val, formVals, dayIndex, props.key),
		},
		shouldUnregister,
		disabled,
	})

	const form = useFormContext<T>()
	const variant = useCustomVariant()
	const theme = useMantineTheme()
	const interval = Interval.fromISO(value)
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
