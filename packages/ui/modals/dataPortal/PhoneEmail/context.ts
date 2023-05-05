import { createFormContext } from '@mantine/form'

export const [PhoneEmailFormProvider, useFormContext, useForm] = createFormContext<FormData>()

export interface FormData {
	phoneNumber: string
	phoneCountryId: string
}
