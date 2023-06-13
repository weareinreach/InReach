import { createFormContext } from '@mantine/form'

interface UserSurveyFormValues {
	birthYear?: number
	reasonForJoin?: string
	communityIds?: string[]
	ethnicityIds?: string[]
	identifyIds?: string[]
	countryOriginId?: string
	immigrationId?: string
	immigrationOther?: string
	ethnicityOther?: string
}

export const [UserSurveyFormProvider, useUserSurveyFormContext, useUserSurveyForm] =
	createFormContext<UserSurveyFormValues>()
