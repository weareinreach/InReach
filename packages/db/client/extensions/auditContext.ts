import { Prisma, prisma } from '~db/client'
import { isIdFor } from '~db/lib/idGen'

function auditedExtension(actorId: string) {
	return Prisma.defineExtension((prisma) =>
		prisma.$extends({
			query: {
				$allModels: {
					async $allOperations({ args, query }) {
						if (!isIdFor('user', actorId)) {
							throw new Error('Invalid userId')
						}
						const [, result] = await prisma.$transaction([
							prisma.$executeRaw`SELECT set_config('app.actor_id', ${actorId}, TRUE)`,
							query(args),
						])
						return result
					},
				},
			},
		})
	)
}
export const getAuditedClient = (actorId: string) => {
	return prisma.$extends(auditedExtension(actorId))
}
