import { generateNestedFreeText, getAuditedClient } from '@weareinreach/db'
import { connectOneId, connectOneIdRequired } from '~api/schemas/nestedOps'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TAttachAttributeSchema } from './mutation.attachAttribute.schema'

const attachAttribute = async ({ ctx, input }: TRPCHandlerParams<TAttachAttributeSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const { locationId, organizationId, serviceId } = input

	const { id: orgId } = organizationId
		? { id: organizationId }
		: await prisma.organization.findFirstOrThrow({
				where: {
					OR: [{ locations: { some: { id: locationId } } }, { services: { some: { id: serviceId } } }],
				},
				select: {
					id: true,
				},
			})

	const freeText = input.text
		? generateNestedFreeText({ orgId, text: input.text, type: 'attSupp', itemId: input.id })
		: undefined

	const result = await prisma.attributeSupplement.create({
		data: {
			id: input.id,
			attribute: connectOneIdRequired(input.attributeId),
			organization: connectOneId(organizationId),
			country: connectOneId(input.countryId),
			govDist: connectOneId(input.govDistId),
			language: connectOneId(input.languageId),
			service: connectOneId(serviceId),
			location: connectOneId(locationId),
			boolean: input.boolean,
			data: input.data,
			text: freeText,
		},
		select: {
			id: true,
		},
	})
	return result
}
export default attachAttribute
