import { createFormContext } from '@mantine/form'

export const [SuggestionFormProvider, useFormContext, useForm] = createFormContext<SuggestionForm>()
export interface SuggestionForm {
	//data for submission
	countryId: string
	orgName: string
	orgSlug: string
	orgWebsite?: string
	orgAddress?: {
		street1?: string
		city?: string
		govDist?: string
		postCode?: string
	}
	serviceCategories?: string[]
	communityFocus?: string[]

	//supportive data
	// communityParent?: string[]
}
