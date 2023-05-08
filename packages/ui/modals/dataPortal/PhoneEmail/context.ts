import { createFormContext, zodResolver } from '@mantine/form'
import parsePhoneNumber from 'libphonenumber-js'
import { z } from 'zod'

export const [PhoneEmailFormProvider, useFormContext, useForm] = createFormContext<FormData>()

const commonItems = {
	isPrimary: z.boolean(),
	published: z.boolean(),
	orgLocationId: z.string(),
	orgServiceId: z.string(),
}

const PhoneEmailSchema = z
	.object({
		phoneNumber: z
			.string()
			.refine((data) => Boolean(parsePhoneNumber(data)?.isValid()), { message: 'Invalid phone number' }),
		phoneCountryId: z.string(),
		phoneTypeId: z.string().optional(),
		customPhoneType: z.string().optional(),
		...commonItems,
	})
	.or(
		z.object({
			emailAddress: z.string(),
			firstName: z.string().optional(),
			lastName: z.string().optional(),
			emailDesc: z.string().optional(),
			...commonItems,
		})
	)

export const formHookParams: Parameters<typeof useForm>[0] = {
	validate: zodResolver(PhoneEmailSchema),
	validateInputOnBlur: true,
	transformValues: ({ phoneNumber, ...data }) => ({
		phoneNumber: phoneNumber ? parsePhoneNumber(phoneNumber)?.nationalNumber : undefined,
		...data,
	}),
}
export interface FormData {
	phoneNumber?: string
	phoneCountryId?: string
	phoneTypeId?: string
	customPhoneType?: string

	emailAddress?: string
	firstName?: string
	lastName?: string
	emailTitle?: string

	isPrimary?: boolean
	published?: boolean
	orgLocationId?: string
	orgServiceId?: string
}
