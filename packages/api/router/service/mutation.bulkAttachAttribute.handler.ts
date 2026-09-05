import { TRPCError } from '@trpc/server'

import { getAuditedClient, prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TBulkAttachAttributeSchema } from './mutation.bulkAttachAttribute.schema'

/**
 * V1 scope: only attributes that don't require a per-instance value (text/boolean/data/language/geo) can be
 * bulk-attached, since the bulk dialog picks one taxonomy value with no per-service custom input. An
 * attribute needing one of those can't be uniformly applied across N services - some might legitimately need
 * a different value, or none at all. Attaching one of those goes through the existing single-record
 * `attachServiceAttribute` flow instead, which does collect a supplement value.
 */
const bulkAttachAttribute = async ({
	ctx,
	input,
}: TRPCHandlerParams<TBulkAttachAttributeSchema, 'protected'>) => {
	const attribute = await prisma.attribute.findUniqueOrThrow({
		where: { id: input.attributeId },
		select: {
			requireText: true,
			requireBoolean: true,
			requireData: true,
			requireLanguage: true,
			requireGeo: true,
		},
	})
	if (
		attribute.requireText ||
		attribute.requireBoolean ||
		attribute.requireData ||
		attribute.requireLanguage ||
		attribute.requireGeo
	) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: 'This attribute requires a per-service value and cannot be bulk-attached.',
		})
	}

	const existing = await prisma.attributeSupplement.findMany({
		where: { attributeId: input.attributeId, serviceId: { in: input.serviceIds } },
		select: { serviceId: true },
	})
	const alreadyHasIds = new Set(existing.map((row) => row.serviceId))
	const toCreate = input.serviceIds.filter((id) => !alreadyHasIds.has(id))

	if (toCreate.length === 0) {
		return { added: 0, alreadyHad: input.serviceIds.length }
	}

	const auditedClient = getAuditedClient(ctx.actorId)
	const result = await auditedClient.attributeSupplement.createMany({
		data: toCreate.map((serviceId) => ({ attributeId: input.attributeId, serviceId })),
	})
	return { added: result.count, alreadyHad: input.serviceIds.length - toCreate.length }
}
export default bulkAttachAttribute
