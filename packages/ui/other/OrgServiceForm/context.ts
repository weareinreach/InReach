import { createFormContext } from '@mantine/form'

export interface EditFormValues {
	title: string
	description?: string
	alertMessage?: {
		title?: string
		text: string
	}
}

export const [EditFormProvider, useEditFormContext, useEditForm] = createFormContext<EditFormValues>()
