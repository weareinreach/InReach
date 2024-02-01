import { z } from 'zod'

import { Prisma } from '@weareinreach/db'
import { CreateManyBase } from '~api/schemaBase/createMany'
import { GenerateAuditLog } from '~api/schemas/create/auditLog'

export const ZAttachServiceTagsSchema = z
	.object({
		serviceId: z.string(),
		tagId: z.string(),
	})
	.array()

export type TAttachServiceTagsSchema = z.infer<typeof ZAttachServiceTagsSchema>
