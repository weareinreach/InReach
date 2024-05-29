import { upsertSingleKey } from '@weareinreach/crowdin/api'
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
const upsert = async ({ ctx, input }: TRPCHandlerParams<TUpsertSchema, 'protected'>) => {
	try {
		const prisma = getAuditedClient(ctx.actorId)
		const { description: desc, operation, id: passedId, orgLocationId, organizationId, ...data } = input

		const isCreateData = (op: 'create' | 'update', inputData: typeof data): inputData is CreateData =>
			op === 'create'
		const isCreate = operation === 'create'

		const id = isCreate ? passedId ?? generateId('orgEmail') : passedId

		const generateDescription = (): GeneratedDescription | undefined => {
			if (!desc || !organizationId) {
				return undefined
			}
			if (isCreateData(operation, data)) {
				const nestedDesc = generateNestedFreeText({
					orgId: organizationId,
					text: desc,
					type: 'websiteDesc',
					itemId: id,
				})
				const crowdinArgs = {
					key: nestedDesc.create.tsKey.create.key,
					text: nestedDesc.create.tsKey.create.text,
				}
				return {
					crowdinArgs,
					prisma: Prisma.validator<Prisma.FreeTextCreateNestedOneWithoutOrgWebsiteInput>()(nestedDesc),
				}
			} else {
				const nestedDesc = generateNestedFreeTextUpsert({
					orgId: organizationId,
					text: desc,
					type: 'websiteDesc',
					itemId: id,
				})
				const crowdinArgs = {
					key: nestedDesc.upsert.create.tsKey.create.key,
					text: nestedDesc.upsert.create.tsKey.create.text,
				}
				return {
					crowdinArgs,
					prisma: Prisma.validator<Prisma.FreeTextUpdateOneWithoutOrgWebsiteNestedInput>()(nestedDesc),
				}
			}
		}
		const description = generateDescription()

		const result = await prisma.$transaction(async (tx) => {
			if (description) {
				const crowdin = await upsertSingleKey({
					isDatabaseString: true,
					...description.crowdinArgs,
				})
				if (description.prisma.create?.tsKey?.create) {
					description.prisma.create.tsKey.create.crowdinId = crowdin.id
				}
			}

			const txnResult = isCreateData(operation, data)
				? await tx.orgWebsite.create({
						data: {
							id,
							...(description && { description: description.prisma }),
							...data,
							locations: createOne(orgLocationId, 'orgLocationId'),
							organization: connectOne(organizationId, 'id'),
						},
					})
				: await tx.orgWebsite.update({
						where: { id },
						data: {
							...(description && { description: description.prisma }),
							...data,
						},
					})

			return txnResult
		})
		return result
	} catch (error) {
		return handleError(error)
	}
}
export default upsert

type CrowdinData = {
	key: string
	text: string
}

type GeneratedDescription = {
	crowdinArgs: CrowdinData
	prisma:
		| Prisma.FreeTextCreateNestedOneWithoutOrgWebsiteInput
		| Prisma.FreeTextUpdateOneWithoutOrgWebsiteNestedInput
}
