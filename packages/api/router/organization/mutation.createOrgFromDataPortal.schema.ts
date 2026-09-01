import { z } from 'zod'

import { ZCreateNewSuggestionSchema } from './mutation.createNewSuggestion.schema'

// Same fields as the public Suggest-an-Org form, plus `description` - a free-text field staff can fill in
// from the Data Portal that the public form doesn't have.
export const ZCreateOrgFromDataPortalSchema = ZCreateNewSuggestionSchema.extend({
	description: z.string().trim().optional(),
})
export type TCreateOrgFromDataPortalSchema = z.infer<typeof ZCreateOrgFromDataPortalSchema>
