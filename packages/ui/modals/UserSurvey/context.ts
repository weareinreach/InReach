import { createFormContext } from '@mantine/form'

interface UserSurveyFormValues {
	birthYear?: number
	reasonForJoin?: string
	communityIds?: []
	ethnicityIds?: []
	identifyIds?: []
	countryOriginId?: string
	immigrationId?: string
}

export const [UserSurveyFormProvider, useUserSurveyFormContext, useUserSurveyForm] =
	createFormContext<UserSurveyFormValues>()
