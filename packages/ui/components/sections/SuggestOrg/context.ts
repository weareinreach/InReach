import { createFormContext } from '@mantine/form'
import { type ApiOutput } from '@weareinreach/api'

export const [SuggestionFormProvider, useFormContext, useForm] = createFormContext<SuggestionForm>()
interface SuggestionForm {
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
	communityParent?: string[]
	searchLocation: string
	locationOptions: {
		value: string
		placeId: string
	}[]
	formOptions: ApiOutput['organization']['suggestionOptions']
}
