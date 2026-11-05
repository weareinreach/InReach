import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

// Previously named `slug` but used as a raw id (`where: { id: slug }` in the handler) - every real caller
// already passed the organization's actual id, so this just renames the field to match, rather than
// continuing to invite the next reader to pass an actual slug and get an empty result.
export const ZGetAllForOrgSchema = z.object({
	organizationId: prefixedId('organization'),
	page: z.number().min(1).default(1),
	pageSize: z.number().min(1).max(100).default(20),
})
export type TGetAllForOrgSchema = z.infer<typeof ZGetAllForOrgSchema>
