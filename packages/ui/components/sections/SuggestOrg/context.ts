import { createFormContext } from '@mantine/form'
import { type ApiOutput } from '@weareinreach/api'
import { z } from 'zod'

export const [SuggestionFormProvider, useFormContext, useForm] = createFormContext<SuggestionForm>()
interface SuggestionForm {
	//data for submission
	countryId: string | null
	orgName: string | null
	orgWebsite: string | null
	orgAddress: {
		street1?: string | null
		city?: string | null
		govDist?: string | null
		postCode?: string | null
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
