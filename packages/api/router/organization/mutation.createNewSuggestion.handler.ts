import { generateId, getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateNewSuggestionSchema } from './mutation.createNewSuggestion.schema'

const createNewSuggestion = async ({
	ctx,
	input,
}: TRPCHandlerParams<TCreateNewSuggestionSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const { countryId, orgName, orgSlug, communityFocus, orgAddress, orgWebsite, serviceCategories } = input
	const organizationId = generateId('organization')

	const result = await prisma.suggestion.create({
		data: {
			organization: {
				create: {
					id: organizationId,
					name: orgName,
					slug: orgSlug,
					source: { connect: { source: 'suggestion' } },
				},
			},
			data: {
				orgWebsite,
				orgAddress,
				countryId,
				communityFocus,
				serviceCategories,
			},
			suggestedBy: { connect: { id: ctx.actorId } },
		},
		select: {
			id: true,
		},
	})
	return result
}
export default createNewSuggestion
