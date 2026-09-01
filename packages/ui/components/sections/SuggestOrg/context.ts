import { createFormContext } from '@mantine/form'

export const [SuggestionFormProvider, useFormContext, useForm] = createFormContext<SuggestionForm>()
export interface SuggestionForm {
	//data for submission
	countryId: string
	orgName: string
	orgSlug: string
	orgWebsite?: string
	existingOrgId?: string
	orgAddress?: {
		street1?: string
		city?: string
		govDist?: string
		postCode?: string
	}
	serviceCategories?: string[]
	communityFocus?: string[]
	/** `variant: 'dataPortal'` only - not part of the public suggestion schema, not sent by the public form. */
	description?: string

	//supportive data
	// communityParent?: string[]
}
