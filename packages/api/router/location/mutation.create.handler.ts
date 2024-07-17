import { createGeoFields, getAuditedClient, Prisma } from '@weareinreach/db'
import { createManyRequired } from '~api/schemas/nestedOps'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateSchema } from './mutation.create.schema'

const create = async ({ ctx, input }: TRPCHandlerParams<TCreateSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const { emails, phones, services, address, orgId, ...rest } = input
	const serviceLinks = (
		!services
			? undefined
			: createManyRequired(
					services.map((serviceId) => {
						return { serviceId }
					})
				)
	) satisfies Prisma.OrgLocationServiceCreateNestedManyWithoutLocationInput | undefined

	const emailLinks = (
		!emails
			? undefined
			: createManyRequired(
					emails.map((orgEmailId) => {
						return { orgEmailId }
					})
				)
	) satisfies Prisma.OrgLocationEmailCreateNestedManyWithoutLocationInput | undefined
	const phoneLinks = (
		!phones
			? undefined
			: createManyRequired(
					phones.map((phoneId) => {
						return { phoneId }
					})
				)
	) satisfies Prisma.OrgLocationPhoneCreateNestedManyWithoutLocationInput | undefined

	const { countryId, govDistId, ...addressRest } = address

	const addressData = {
		...addressRest,
		...createGeoFields({ longitude: address.longitude, latitude: address.latitude }),
		country: {
			connect: { id: countryId },
		},
		...(govDistId && { govDist: { connect: { id: govDistId } } }),
	}

	const createArgs = Prisma.validator<Prisma.OrgLocationCreateArgs>()({
		data: {
			...rest,
			...addressData,
			organization: {
				connect: { id: orgId },
			},
			emails: emailLinks,
			phones: phoneLinks,
			services: serviceLinks,
		},
	})

	const result = await prisma.orgLocation.create(createArgs)

	return result
}
export default create
