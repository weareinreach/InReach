import { Prisma } from '@weareinreach/db'
import { z } from 'zod'

import { CreationBase } from '../common'
import { CreateAuditLog } from '../create/auditLog'

const createNewSchema = z.object({
	name: z.string(),
	description: z.string().optional(),
})

export const CreateNew = () => {
	const { dataParser: parser, inputSchema } = CreationBase(createNewSchema)

	const dataParser = parser.transform(({ data, actorId, operation }) =>
		Prisma.validator<Prisma.PermissionCreateArgs>()({
			data: {
				name: data.name,
				description: data.description,
				auditLogs: CreateAuditLog({ actorId, operation, to: data }),
			},
		})
	)

	return { dataParser, inputSchema }
}
