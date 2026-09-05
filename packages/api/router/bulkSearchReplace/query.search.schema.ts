import { z } from 'zod'

// Six independent search-scope checkboxes - each gates one OR'd clause in the handler. Attributes/tags
// are opt-in (default false) since they're a different kind of match (label text on a fixed taxonomy
// value, not free text on the record itself); name/description default on.
export const ZBulkSearchReplaceScope = z.object({
	orgName: z.boolean().default(true),
	orgDescription: z.boolean().default(true),
	serviceName: z.boolean().default(true),
	serviceDescription: z.boolean().default(true),
	serviceAttributes: z.boolean().default(false),
	serviceTags: z.boolean().default(false),
})
export type TBulkSearchReplaceScope = z.infer<typeof ZBulkSearchReplaceScope>

export const ZBulkSearchReplaceSchema = z.object({
	search: z.string().min(1),
	scope: ZBulkSearchReplaceScope,
	// Service-level deleted exclusion is unconditional (see the handler) - this is organization-level only.
	deleted: z.boolean().optional(),
	// Narrows to services carrying ANY of the selected ids, independent of the six scope checkboxes above
	// - a service can be filtered by tag/attribute even if the search term itself matched via name or
	// description, not the tag/attribute. When either is set, an org only qualifies via a matching
	// service (its own name/description match alone no longer qualifies it) - see the handler.
	serviceTagIds: z.array(z.string()).optional(),
	serviceAttributeIds: z.array(z.string()).optional(),
	take: z.number().int().min(1).max(100).default(25),
	skip: z.number().int().min(0).default(0),
})
export type TBulkSearchReplaceSchema = z.infer<typeof ZBulkSearchReplaceSchema>

export const ZMatchField = z.enum([
	'orgName',
	'orgDescription',
	'serviceName',
	'serviceDescription',
	'serviceAttributes',
	'serviceTags',
])
export type TMatchField = z.infer<typeof ZMatchField>
