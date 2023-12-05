import { ActionIcon, Group, Input, type InputProps, Stack, Text } from '@mantine/core'
import { DateTime, Interval } from 'luxon'
import { useEffect, useRef, useState } from 'react'
import { type FieldValues, useController, type UseControllerProps, useFormContext } from 'react-hook-form'

import { useCustomVariant } from '~ui/hooks'
import { Icon } from '~ui/icon'

interface TimeRangeComponent extends Omit<InputProps, 'value'> {
	value?: Interval
	deleteHandler: () => void
}
export type HoursRangeProps<T extends FieldValues> = UseControllerProps<T> & TimeRangeComponent

export const TimeRange = <T extends FieldValues = { [k: string]: Interval<true> }>({
	name,
	control,
	defaultValue,
	rules = { validate: (val: unknown) => (Interval.isInterval(val) ? true : 'Invalid times') },
	shouldUnregister,
	deleteHandler,
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
	})
	const form = useFormContext<T>()
	const variant = useCustomVariant()
	const [openValue, setOpenValue] = useState(value?.start?.toFormat('HH:mm'))
	const [closeValue, setCloseValue] = useState(value?.end?.toFormat('HH:mm'))
	console.log(form)
	useEffect(() => {
		if (!openValue || !closeValue) return
		const start = DateTime.fromFormat(openValue, 'HH:mm')
		const end = DateTime.fromFormat(closeValue, 'HH:mm')

		const updatedValue = value
			? value.set({
					start,
					end,
			  })
			: Interval.fromDateTimes(start, end)
		if (updatedValue.isValid) {
			onChange(updatedValue)
		} else {
			onChange(null)
			form && form.setError(name, { message: 'Invalid time range' })
		}
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
							{...field}
							{...props}
						/>
					</Stack>
					<ActionIcon>
						<Icon icon='carbon:trash-can' onClick={deleteHandler} height={24} />
					</ActionIcon>
				</Group>
				<Input.Error>{fieldState.error?.message}</Input.Error>
			</Input.Wrapper>
		</Stack>
	)
}
