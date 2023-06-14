import { createFormContext } from '@mantine/form'
import { t } from 'i18next'
import { z } from 'zod'

interface SignUpFormValues {
	email: string
	name: string
	password: string
	language?: string
	location?: {
		city?: string
		govDist?: string
		country?: string
	}
	searchLocation: string
	locationOptions: {
		value: string
		placeId: string
	}[]
	lawPractice?: string
	otherLawPractice?: string
	servProvider?: string
	servProviderOther?: string
	userType: 'individual' | 'provider' | 'lcr'
	cognitoMessage?: string
	cognitoSubject?: string
}

const basicFields = {
	name: z.string(),
	email: z.string().email({ message: t('form-error-enter-valid-email') satisfies string }),
	password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[$&+,:;=?@#|'<>.^*()%!-]).{8,}$/, {
		message: t('form-error-password-req') satisfies string,
	}),
}

const Individual = z.object({ ...basicFields, userType: z.literal('individual') })
const Provider = z.object({
	...basicFields,
	userType: z.literal('provider'),
	language: z.string(),
	location: z.object({
		city: z.string(),
		govDist: z.string(),
		country: z.string(),
	}),
	lawPractice: z.string().optional(),
	otherLawPractice: z.string().optional(),
	servProvider: z.string(),
	servProviderOther: z.string().optional(),
})
const LCR = z.object({
	...basicFields,
	userType: z.literal('lcr'),
	language: z.string(),
	location: z.object({
		city: z.string(),
		govDist: z.string(),
		country: z.string(),
	}),
})
export const SignUpSchema = z.discriminatedUnion('userType', [Individual, Provider, LCR])

export const [SignUpFormProvider, useSignUpFormContext, useSignUpForm] = createFormContext<SignUpFormValues>()
