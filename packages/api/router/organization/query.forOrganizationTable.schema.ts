import { z } from 'zod'

const ZDateRange = z
	.object({
		from: z.date().optional(),
		to: z.date().optional(),
	})
	.partial()

export const ZSortableColumn = z.enum(['name', 'lastVerified', 'updatedAt', 'createdAt'])

const ZSortingState = z.array(
	z.object({
		id: ZSortableColumn,
		desc: z.boolean(),
	})
)

// Doesn't map to one literal DB column. 'public' = source.source === 'suggestion' AND
// creatorHadDpAccess === false. 'internal' is a union of the other two real origins: suggested by
// someone with Data Portal access, OR added directly via the Data Portal - both mean "not actually the
// public." Omitted entirely = no filter ("All").
export const ZCreateMethod = z.enum(['public', 'internal'])

export const ZForOrganizationTableSchema = z.object({
	published: z.boolean().optional(),
	deleted: z.boolean().optional(),
	createMethod: ZCreateMethod.optional(),
	search: z.string().optional(),
	lastVerified: ZDateRange.optional(),
	updatedAt: ZDateRange.optional(),
	createdAt: ZDateRange.optional(),
	sorting: ZSortingState.optional(),
	take: z.number().int().min(1).max(200).default(50),
	skip: z.number().int().min(0).default(0),
})
export type TForOrganizationTableSchema = z.infer<typeof ZForOrganizationTableSchema>
