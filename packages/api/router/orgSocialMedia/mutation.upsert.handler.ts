import SocialLinks from 'social-links'

import { generateId, getAuditedClient } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { connectOne, connectOneIdRequired, createOne } from '~api/schemas/nestedOps'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type Create, type TUpsertSchema } from './mutation.upsert.schema'

const socialLinkValidator = new SocialLinks()

type CreateData = Pick<Create, 'deleted' | 'published' | 'orgLocationOnly'>

export const upsert = async ({ ctx, input }: TRPCHandlerParams<TUpsertSchema, 'protected'>) => {
	try {
		const prisma = getAuditedClient(ctx.actorId)
		const {
			operation,
			id: passedId,
			url,
			username: passedUsername,
			orgLocationId,
			organizationId,
			serviceId,
			...data
		} = input
		const isCreateData = (op: 'create' | 'update', inputData: typeof data): inputData is CreateData =>
			op === 'create'
		const isCreate = operation === 'create'
		const id = isCreate ? passedId ?? generateId('orgSocialMedia') : passedId
		let username = passedUsername

		if (url && !passedUsername) {
			const detectedService = socialLinkValidator.detectProfile(url)
			username = socialLinkValidator.getProfileId(detectedService, url)
		}

		const hasNeededFields =
			typeof url === 'string' && typeof username === 'string' && typeof serviceId === 'string'

		const result =
			isCreateData(operation, data) && hasNeededFields
				? await prisma.orgSocialMedia.create({
						data: {
							id,
							url,
							username: username as string,
							...data,
							organization: connectOne(organizationId, 'id'),
							service: connectOneIdRequired(serviceId),
							locations: createOne(orgLocationId, 'orgLocationId'),
						},
					})
				: await prisma.orgSocialMedia.update({
						where: { id },
						data,
					})

		return result
	} catch (error) {
		return handleError(error)
	}
}
export default upsert
