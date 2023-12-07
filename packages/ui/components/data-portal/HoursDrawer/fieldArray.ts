import { DateTime, Interval } from 'luxon'
import { type Control, useFieldArray, type UseFormReturn } from 'react-hook-form'

import { type DayIndex, dayIndicies, type ZFormSchema } from './schema'

export const useDayFieldArray = (control: Control<ZFormSchema>) => {
	return {
		'0': useFieldArray({ control, name: '0' }),
		'1': useFieldArray({ control, name: '1' }),
		'2': useFieldArray({ control, name: '2' }),
		'3': useFieldArray({ control, name: '3' }),
		'4': useFieldArray({ control, name: '4' }),
		'5': useFieldArray({ control, name: '5' }),
		'6': useFieldArray({ control, name: '6' }),
	}
}

export const defaultInterval = (tz: string) => {
	const interval = Interval.fromDateTimes(
		DateTime.fromFormat('09:00', 'HH:mm', { zone: tz }),
		DateTime.fromFormat('17:00', 'HH:mm', { zone: tz })
	)
	if (!interval.isValid) throw new Error('Invalid interval', { cause: interval })
	return interval
}

export const updateClosed = ({ form, dayIndex, newValue, dayFields }: UpdateClosedArgs) =>
	form
		.getValues()
		[dayIndex]?.forEach((value, i) => dayFields[dayIndex].update(i, { ...value, closed: newValue }))

export const updateOpen24 = ({ form, dayIndex, newValue, dayFields }: UpdateOpen24Args) =>
	form.getValues()[dayIndex]?.forEach((value, i) => {
		const interval = ((newValue && value.interval.isValid
			? value.interval.set({
					start: DateTime.fromFormat('00:00', 'HH:mm', { zone: value.tz }),
					end: DateTime.fromFormat('23:59', 'HH:mm', { zone: value.tz }),
			  })
			: form.formState.defaultValues &&
			  form.formState.defaultValues[dayIndex]?.find((initial) => initial?.id === value.id)?.interval) ??
			defaultInterval(value.tz)) as Interval<true>
		dayFields[dayIndex].update(i, {
			...value,
			interval,
			open24hours: newValue,
		})
	})
export const updateTz = ({ form, newValue }: UpdateTzArgs) => {
	const current = form.getValues()
	for (const day of dayIndicies) {
		const data = current[day]
		if (!data) continue
		form.setValue(
			day,
			data.map((record) => ({ ...record, tz: newValue }))
		)
	}
}
interface UpdateClosedArgs {
	form: UseFormReturn<ZFormSchema>
	dayIndex: DayIndex
	newValue: boolean
	dayFields: ReturnType<typeof useDayFieldArray>
}
interface UpdateOpen24Args {
	form: UseFormReturn<ZFormSchema>
	dayIndex: DayIndex
	newValue: boolean
	dayFields: ReturnType<typeof useDayFieldArray>
}
interface UpdateTzArgs {
	form: UseFormReturn<ZFormSchema>
	newValue: string
}
