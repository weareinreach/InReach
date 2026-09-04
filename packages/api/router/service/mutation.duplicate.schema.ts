import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

// Deliberately no `organizationId` field - the handler derives it from the source service itself
// rather than trusting a client-supplied value (see mutation.duplicate.handler.ts).
export const ZDuplicateSchema = z.object({
	sourceServiceId: prefixedId('orgService'),
	name: z.string().min(1),
	// Deliberately never populated from the source - the wizard's description field always starts
	// blank, so this is only ever whatever the person typed fresh, never a copy.
	description: z.string().optional(),
	copyOptions: z.object({
		attributes: z.boolean(),
		hours: z.boolean(),
		contactInfo: z.boolean(),
		coverageArea: z.boolean(),
		serviceTags: z.boolean(),
	}),
	locationIds: prefixedId('orgLocation').array(),
})
export type TDuplicateSchema = z.infer<typeof ZDuplicateSchema>
