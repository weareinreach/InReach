import { z } from 'zod'

export const ZAttachServiceTagsSchema = z
	.object({
		serviceId: z.string(),
		tagId: z.string(),
	})
	.array()

export type TAttachServiceTagsSchema = z.infer<typeof ZAttachServiceTagsSchema>
