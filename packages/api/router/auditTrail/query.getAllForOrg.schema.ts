import { z } from 'zod'

export const ZGetAllForOrgSchema = z.object({
	slug: z.string(),
	page: z.number().min(1).default(1),
	pageSize: z.number().min(1).max(100).default(20),
})
export type TGetAllForOrgSchema = z.infer<typeof ZGetAllForOrgSchema>
