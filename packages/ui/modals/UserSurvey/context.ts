import { createFormContext } from '@mantine/form'

interface UserSurveyFormValues {
	birthYear?: number | undefined
	reasonForJoin?: string
	communityIds?: []
	ethnicityIds?: []
	identifyIds?: []
	countryOriginId?: string
	immigrationId?: string
	currentCity?: string
	currentGovDistId?: string
	currentCountryId?: string
}

export const [UserSurveyFormProvider, useUserSurveyFormContext, useUserSurveyForm] =
	createFormContext<UserSurveyFormValues>()
