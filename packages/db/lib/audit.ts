/* eslint-disable @typescript-eslint/ban-types */
import { prisma, type Prisma, type PrismaClient } from '~db/client'

import { isIdFor } from './idGen'

export const setAuditId = async (actorId: string, client?: TransactionClient) => {
	if (!isIdFor('user', actorId)) {
		throw new Error('Invalid userId')
	}

	const db = client || prisma

	await db.$executeRaw`SELECT set_config('app.actor_id', ${actorId}, true);`
}

type TransactionClient = Omit<
	PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
	'$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>
type DefaultArgs = {
	result: {}
	model: {}
	query: {}
	client: {}
}
