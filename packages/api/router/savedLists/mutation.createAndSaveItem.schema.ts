import { z } from 'zod'

import { Prisma } from '@weareinreach/db'
import { CreateBase } from '~api/schemaBase/create'
import { GenerateAuditLog } from '~api/schemas/create/auditLog'
import { prefixedId } from '~api/schemas/idPrefix'
import { createManyRequired, createOneSeparateLog } from '~api/schemas/nestedOps'

export const ZCreateAndSaveItemSchema = z
	.object({
		name: z.string(),
		organizationId: prefixedId('organization').optional(),
		serviceId: prefixedId('orgService').optional(),
	})
	.refine(
		(keys) => {
			if (keys.organizationId || keys.serviceId) return true
			else return false
		},
		{ message: 'Requires one of the following: organizationId, serviceId' }
	)

export type TCreateAndSaveItemSchema = z.infer<typeof ZCreateAndSaveItemSchema>
