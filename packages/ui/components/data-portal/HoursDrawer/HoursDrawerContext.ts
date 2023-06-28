import { createFormContext } from '@mantine/form'

import { type ApiOutput } from '@weareinreach/api'

export const [HoursDrawerFormProvider, useFormContext, useForm] = createFormContext<HoursDrawerForm>()
interface HoursDrawerForm {
	data?: {
		dayIndex?: number
		start?: Date
		end?: Date
		tz?: string
		close?: boolean
	}[]
	formOptions: ApiOutput['orgHours']
}
