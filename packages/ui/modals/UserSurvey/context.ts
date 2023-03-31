import { createFormContext } from '@mantine/form'

interface UserSurveyFormValues {
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
	userType: 'seeker' | 'provider' | 'lcr'
	cognitoMessage?: string
	cognitoSubject?: string
}

export const [UserSurveyFormProvider, useUserSurveyFormContext, useUserSurveyForm] =
	createFormContext<UserSurveyFormValues>()
