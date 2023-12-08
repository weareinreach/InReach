import { DateTime, Interval } from 'luxon'
import { type Control, useFieldArray, UseFieldArrayReturn, type UseFormReturn } from 'react-hook-form'

import { type DayIndex, dayIndicies, type ZFormSchema } from './schema'

// export const useDayFieldArray = (control: Control<ZFormSchema>) => ({
// 	'0': useFieldArray({ control, name: '0' }),
// 	'1': useFieldArray({ control, name: '1' }),
// 	'2': useFieldArray({ control, name: '2' }),
// 	'3': useFieldArray({ control, name: '3' }),
// 	'4': useFieldArray({ control, name: '4' }),
// 	'5': useFieldArray({ control, name: '5' }),
// 	'6': useFieldArray({ control, name: '6' }),
// })

export const defaultInterval = (tz: string | null) => {
	const interval = Interval.fromDateTimes(
		DateTime.fromFormat('09:00', 'HH:mm', { zone: tz ?? 'America/New_York' }),
		DateTime.fromFormat('17:00', 'HH:mm', { zone: tz ?? 'America/New_York' })
	)
	if (!interval.isValid) throw new Error('Invalid interval', { cause: interval })
	return interval.toISO()
}

export const updateClosed = ({ dayIndex, newValue, form, formData }: UpdateClosedArgs) =>
	form.setValue(
		'data',
		form.getValues()?.data.map((item) => {
			if (item.dayIndex === dayIndex) {
				return {
					...item,
					closed: newValue,
				}
			} else {
				return item
			}
		})
	)

export const updateOpen24 = ({ dayIndex, newValue, form, formData }: UpdateOpen24Args) =>
	form.setValue(
		'data',
		form.getValues()?.data.map((item) => {
			if (item.dayIndex === dayIndex) {
				return {
					...item,
					open24hours: newValue,
				}
			} else {
				return item
			}
		})
	)
export const updateTz = ({ form, newValue, formData }: UpdateTzArgs) =>
	form.setValue(
		'data',
		form.getValues()?.data.map((item) => ({
			...item,
			tz: newValue,
		}))
	)
interface UpdateClosedArgs {
	formData: ZFormSchema['data']
	dayIndex: DayIndex
	newValue: boolean
	form: UseFormReturn<ZFormSchema>
}
interface UpdateOpen24Args {
	formData: ZFormSchema['data']
	dayIndex: DayIndex
	newValue: boolean
	form: UseFormReturn<ZFormSchema>
}
interface UpdateTzArgs {
	formData: ZFormSchema['data']
	form: UseFormReturn<ZFormSchema>
	newValue: string
}
