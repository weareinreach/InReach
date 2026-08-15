import { buildContextUrl, syncDatabaseStringIfChanged } from '@weareinreach/crowdin/api'
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

		// Crowdin sync (a network call to a third party) must not happen inside the DB transaction below -
		// Prisma's interactive transactions have a ~5s timeout, and holding it open across an external API
		// call risks "Transaction already closed" once Crowdin is slow to respond.
		if (description && orgId) {
			const { slug } = await prisma.organization.findUniqueOrThrow({
				where: { id: orgId },
				select: { slug: true },
			})
			const existing = isCreate
				? null
				: await prisma.orgPhone.findUnique({
						where: { id },
						select: { description: { select: { tsKey: { select: { text: true, crowdinId: true } } } } },
					})
			const crowdinId = await syncDatabaseStringIfChanged({
				key: description.crowdinArgs.key,
				newText: description.crowdinArgs.text,
				previousText: existing?.description?.tsKey.text,
				previousCrowdinId: existing?.description?.tsKey.crowdinId,
				context: buildContextUrl(slug),
			})
			if (description.prisma.create?.tsKey?.create && crowdinId) {
				description.prisma.create.tsKey.create.crowdinId = crowdinId
			}
		}

		const result = await prisma.$transaction(async (tx) => {
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
		Prisma.FreeTextCreateNestedOneWithoutOrgPhoneInput | Prisma.FreeTextUpdateOneWithoutOrgPhoneNestedInput
}
