import { createFormContext } from '@mantine/form'

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
	servProvider?: string
}

export const [SignUpFormProvider, useSignUpFormContext, useSignUpForm] = createFormContext<SignUpFormValues>()
