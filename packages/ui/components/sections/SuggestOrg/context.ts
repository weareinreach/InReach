import { createFormContext } from '@mantine/form'
import { type ApiOutput } from '@weareinreach/api'

export const [SuggestionFormProvider, useFormContext, useForm] = createFormContext<SuggestionForm>()
interface SuggestionForm {
	data?: {
		countryId?: string
		orgName?: string
		orgWebsite?: string
		orgAddress?: {
			street1?: string
			street2?: string
			city?: string
			govDist?: string
			postCode?: string
		}
		serviceCategories?: string[]
		communityFocus?: string[]
	}
	communityParent?: string[]
	searchLocation: string
	locationOptions: {
		value: string
		placeId: string
	}[]
	formOptions: ApiOutput['organization']['suggestionOptions']
}
