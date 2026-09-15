import { buildContextUrl, removeSingleKey, syncDatabaseStringIfChanged } from '@weareinreach/crowdin/api'
import { generateNestedFreeTextUpsert, getAuditedClient } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { connectOneId } from '~api/schemas/nestedOps'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TAttributeEditWrapperSchema } from './mutation.AttributeEditWrapper.schema'

const AttributeEditWrapper = async ({
	ctx,
	input,
}: TRPCHandlerParams<TAttributeEditWrapperSchema, 'protected'>) => {
	try {
		const prisma = getAuditedClient(ctx.actorId)
		const { id, action } = input

		if (action === 'delete') {
			// Fetch the Crowdin-registered translation string (if any) *before* deleting anything -
			// this data is gone once the row is gone, and it's needed to clean up both the DB's
			// TranslationKey row and the third-party Crowdin string.
			const existing = await prisma.attributeSupplement.findUniqueOrThrow({
				where: { id },
				select: { text: { select: { tsKey: { select: { key: true, ns: true, crowdinId: true } } } } },
			})
			const deleteResult = await prisma.$transaction(async (tx) => {
				const result = await tx.attributeSupplement.delete({ where: { id } })
				if (existing.text) {
					// Cascades to delete the now-orphaned FreeText row too - nothing else references
					// either row, since every attribute's free text gets its own dedicated
					// TranslationKey/FreeText pair (never shared across attributes).
					await tx.translationKey.delete({
						where: { ns_key: { ns: existing.text.tsKey.ns, key: existing.text.tsKey.key } },
					})
				}
				return result
			})
			// Crowdin cleanup happens after the DB transaction, not inside it - it's a network call to a
			// third party and interactive transactions have a ~5s timeout. If this fails, the DB is
			// already consistent; a lingering unused Crowdin string is the only side effect.
			if (existing.text?.tsKey.crowdinId) {
				await removeSingleKey({ crowdinId: existing.text.tsKey.crowdinId, isDatabaseString: true })
			}
			return deleteResult
		}

		if (action === 'update') {
			const { boolean, data, text, countryId, govDistId, languageId } = input
			const existing = await prisma.attributeSupplement.findUniqueOrThrow({
				where: { id },
				select: {
					textId: true,
					organizationId: true,
					serviceId: true,
					locationId: true,
					text: { select: { tsKey: { select: { text: true, crowdinId: true } } } },
				},
			})

			const { id: orgId, slug: orgSlug } = existing.organizationId
				? await prisma.organization.findUniqueOrThrow({
						where: { id: existing.organizationId },
						select: { id: true, slug: true },
					})
				: await prisma.organization.findFirstOrThrow({
						where: {
							OR: [
								{ locations: { some: { id: existing.locationId ?? undefined } } },
								{ services: { some: { id: existing.serviceId ?? undefined } } },
							],
						},
						select: { id: true, slug: true },
					})

			const updateText = text
				? generateNestedFreeTextUpsert({
						orgId,
						type: 'attSupp',
						itemId: id,
						freeTextId: existing.textId,
						text,
					})
				: undefined

			// Crowdin sync (a network call to a third party) must not happen inside the DB transaction
			// below - Prisma's interactive transactions have a ~5s timeout, and holding it open across an
			// external API call risks "Transaction already closed" once Crowdin is slow to respond.
			if (updateText) {
				const crowdinId = await syncDatabaseStringIfChanged({
					key: updateText.upsert.create.tsKey.create.key,
					newText: updateText.upsert.create.tsKey.create.text,
					previousText: existing.text?.tsKey.text,
					previousCrowdinId: existing.text?.tsKey.crowdinId,
					context: buildContextUrl(orgSlug, existing.locationId ?? undefined),
				})
				if (crowdinId) {
					updateText.upsert.create.tsKey.create.crowdinId = crowdinId
				}
			}

			const updateResult = await prisma.attributeSupplement.update({
				where: { id },
				data: {
					boolean,
					data,
					country: connectOneId(countryId),
					govDist: connectOneId(govDistId),
					language: connectOneId(languageId),
					text: updateText,
				},
			})
			return updateResult
		}

		const current = await prisma.attributeSupplement.findUniqueOrThrow({
			where: { id },
			select: { active: true },
		})
		const updateResult = await prisma.attributeSupplement.update({
			where: { id },
			data: { active: !current.active },
		})
		return updateResult
	} catch (error) {
		return handleError(error)
	}
}
export default AttributeEditWrapper
