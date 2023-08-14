import { type z } from 'zod'

import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateAndSaveItemSchema, ZCreateAndSaveItemSchema } from './mutation.createAndSaveItem.schema'

export const createAndSaveItem = async ({
	ctx,
	input,
}: TRPCHandlerParams<TCreateAndSaveItemSchema, 'protected'>) => {
	const { dataParser } = ZCreateAndSaveItemSchema()

	const inputData = {
		actorId: ctx.session.user.id,
		operation: 'CREATE',
		ownedById: ctx.session.user.id,
		data: input,
	} satisfies z.input<typeof dataParser>

	const data = dataParser.parse(inputData)
	const result = await prisma.userSavedList.create(data)

	const flattenedResult = {
		...result,
		organizations: result.organizations.map((x) => x.organizationId),
		services: result.services.map((x) => x.serviceId),
	}
	return flattenedResult
}
