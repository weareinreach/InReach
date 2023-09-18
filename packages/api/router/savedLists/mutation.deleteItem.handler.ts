import { type z } from 'zod'

import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TDeleteItemSchema, ZDeleteItemSchema } from './mutation.deleteItem.schema'

export const deleteItem = async ({ ctx, input }: TRPCHandlerParams<TDeleteItemSchema, 'protected'>) => {
	const { dataParser } = ZDeleteItemSchema()

	const inputData = {
		actorId: ctx.session.user.id,
		ownedById: ctx.session.user.id,
		operation: 'UNLINK',
		data: input,
	} satisfies z.input<typeof dataParser>
	const data = dataParser.parse(inputData)

	const result = await prisma.userSavedList.update(data)
	const flattenedResult = {
		...result,
		organizations: result.organizations.map((x) => x.organizationId),
		services: result.services.map((x) => x.serviceId),
	}
	return flattenedResult
}
