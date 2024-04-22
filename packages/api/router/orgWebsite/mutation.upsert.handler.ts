import {
	generateId,
	generateNestedFreeText,
	generateNestedFreeTextUpsert,
	getAuditedClient,
	Prisma,
} from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { connectOne, createOne } from '~api/schemas/nestedOps'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type Create, type TUpsertSchema } from './mutation.upsert.schema'

type CreateData = Pick<Create, 'url' | 'isPrimary' | 'deleted' | 'published' | 'orgLocationOnly'>
export const upsert = async ({ ctx, input }: TRPCHandlerParams<TUpsertSchema, 'protected'>) => {
	try {
		const prisma = getAuditedClient(ctx.actorId)
		const { description: desc, operation, id: passedId, orgLocationId, organizationId, ...data } = input

		const isCreateData = (op: 'create' | 'update', inputData: typeof data): inputData is CreateData =>
			op === 'create'
		const isCreate = operation === 'create'

		const id = isCreate ? passedId ?? generateId('orgEmail') : passedId

		const generateDescription = ():
			| Prisma.FreeTextCreateNestedOneWithoutOrgWebsiteInput
			| Prisma.FreeTextUpdateOneWithoutOrgWebsiteNestedInput
			| undefined => {
			if (!desc || !organizationId) {
				return undefined
			}
			if (isCreateData(operation, data)) {
				return Prisma.validator<Prisma.FreeTextCreateNestedOneWithoutOrgWebsiteInput>()(
					generateNestedFreeText({
						orgId: organizationId,
						text: desc,
						type: 'websiteDesc',
						itemId: id,
					})
				)
			} else {
				return Prisma.validator<Prisma.FreeTextUpdateOneWithoutOrgWebsiteNestedInput>()(
					generateNestedFreeTextUpsert({
						orgId: organizationId,
						text: desc,
						type: 'websiteDesc',
						itemId: id,
					})
				)
			}
		}
		const description = generateDescription()

		const result = isCreateData(operation, data)
			? await prisma.orgWebsite.create({
					data: {
						id,
						...(description && { description }),
						...data,
						locations: createOne(orgLocationId, 'orgLocationId'),
						organization: connectOne(organizationId, 'id'),
					},
				})
			: await prisma.orgWebsite.update({
					where: { id },
					data: {
						...(description && { description }),
						...data,
					},
				})

		return result
	} catch (error) {
		return handleError(error)
	}
}
export default upsert
