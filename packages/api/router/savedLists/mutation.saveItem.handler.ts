import { type z } from 'zod'

import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TSaveItemSchema, ZSaveItemSchema } from './mutation.saveItem.schema'

export const saveItem = async ({ ctx, input }: TRPCHandlerParams<TSaveItemSchema, 'protected'>) => {
	try {
		const { dataParser } = ZSaveItemSchema()

		const inputData = {
			actorId: ctx.session.user.id,
			ownedById: ctx.session.user.id,
			operation: 'LINK',
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
	} catch (error) {
		handleError(error)
	}
}
