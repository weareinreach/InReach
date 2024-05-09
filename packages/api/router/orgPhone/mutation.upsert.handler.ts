import { upsertSingleKey } from '@weareinreach/crowdin/api'
import {
	generateId,
	generateNestedFreeText,
	generateNestedFreeTextUpsert,
	getAuditedClient,
	Prisma,
} from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { connectOne, connectOneRequired, createOne } from '~api/schemas/nestedOps'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type Create, type TUpsertSchema } from './mutation.upsert.schema'

type CreateData = Pick<
	Create,
	'number' | 'deleted' | 'ext' | 'locationOnly' | 'primary' | 'published' | 'serviceOnly'
>
const upsert = async ({ ctx, input }: TRPCHandlerParams<TUpsertSchema, 'protected'>) => {
	try {
		const prisma = getAuditedClient(ctx.actorId)
		const { operation, id: passedId, countryId, description: desc, orgId, phoneTypeId, ...data } = input

		const isCreateData = (op: 'create' | 'update', inputData: typeof data): inputData is CreateData =>
			op === 'create'
		const isCreate = isCreateData(operation, data)
		const id = passedId ?? generateId('orgPhone')

		const generateDescription = (): GeneratedDescription | undefined => {
			if (!desc || !orgId) {
				return undefined
			}
			if (isCreate) {
				const nestedDesc = generateNestedFreeText({
					orgId,
					text: desc,
					type: 'phoneDesc',
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
					orgId,
					text: desc,
					type: 'phoneDesc',
					itemId: id,
				})
				const crowdinArgs = {
					key: nestedDesc.upsert.create.tsKey.create.key,
					text: nestedDesc.upsert.create.tsKey.create.text,
				}
				return {
					crowdinArgs,
					prisma: Prisma.validator<Prisma.FreeTextUpdateOneWithoutOrgPhoneNestedInput>()(nestedDesc),
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

			const txnResult =
				isCreate && countryId
					? await tx.orgPhone.create({
							data: {
								id,
								...data,
								description: description?.prisma,
								country: connectOneRequired(countryId, 'id'),
								phoneType: connectOne(phoneTypeId, 'id'),
								organization: createOne(orgId, 'organizationId'),
							},
						})
					: await tx.orgPhone.update({
							where: { id },
							data: {
								...data,
								country: connectOne(countryId, 'id'),
								phoneType: connectOne(phoneTypeId, 'id'),
								description: description?.prisma,
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
		| Prisma.FreeTextCreateNestedOneWithoutOrgPhoneInput
		| Prisma.FreeTextUpdateOneWithoutOrgPhoneNestedInput
}
