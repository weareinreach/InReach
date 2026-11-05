import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZForLocationPageSchema = z.object({
	id: prefixedId('orgLocation'),
	// Required, not inferred from the location alone - without this, /org/<any-slug>/<any-location-id>
	// rendered that location's real data regardless of which org actually owns it (an IDOR: nothing tied
	// the location being fetched to the organization named in the URL).
	organizationId: prefixedId('organization'),
})
export type TForLocationPageSchema = z.infer<typeof ZForLocationPageSchema>
