import { z } from 'zod'

import { Prisma } from '@weareinreach/db'
import { CreateBase } from '~api/schemaBase/create'
import { CreateAuditLog } from '~api/schemas/create/auditLog'
import { prefixedId } from '~api/schemas/idPrefix'

export const ZCreateSchema = () => {
	const { dataParser: parser, inputSchema } = CreateBase(z.object({ name: z.string() }))

	const dataParser = parser
		.extend({ ownedById: prefixedId('user') })
		.transform(({ actorId, operation, data, ownedById }) => {
			const { name } = data
			return Prisma.validator<Prisma.UserSavedListCreateArgs>()({
				data: {
					name,
					ownedById,
					auditLogs: CreateAuditLog({ actorId, operation, to: { name, ownedById } }),
				},
				select: {
					id: true,
					name: true,
				},
			})
		})

	return { dataParser, inputSchema }
}
export type TCreateSchema = z.infer<ReturnType<typeof ZCreateSchema>['inputSchema']>
