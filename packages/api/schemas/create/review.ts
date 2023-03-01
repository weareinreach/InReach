import { Prisma } from '@weareinreach/db'
import { z } from 'zod'

import { idString } from '~api/schemas/common'
import { connectOne, connectOneRequired } from '~api/schemas/nestedOps'

import { CreateAuditLog } from './auditLog'

export const CreateReviewInput = {
	rating: z.number(),
	reviewText: z.string().optional(),
	visible: z.boolean().optional(),
	toxicity: z.number().optional(),
	lcrCity: z.string().optional(),
	langConfidence: z.number().optional(),
	organizationId: idString,
	orgServiceId: idString.optional(),
	orgLocationId: idString.optional(),
	languageId: idString.optional(),
	lcrGovDistId: idString.optional(),
	lcrCountryId: idString.optional(),
}

export const CreateReview = z.object({ ...CreateReviewInput, userId: idString }).transform((data) => {
	const {
		userId,
		organizationId,
		orgServiceId,
		orgLocationId,
		languageId,
		lcrGovDistId,
		lcrCountryId,
		...scalarData
	} = data

	const user = connectOneRequired({ id: userId })
	const organization = connectOneRequired({ id: organizationId })
	const orgService = orgServiceId ? connectOne({ id: orgServiceId }) : undefined
	const orgLocation = orgLocationId ? connectOne({ id: orgLocationId }) : undefined
	const language = languageId ? connectOne({ id: languageId }) : undefined
	const lcrGovDist = lcrGovDistId ? connectOne({ id: lcrGovDistId }) : undefined
	const lcrCountry = lcrCountryId ? connectOne({ id: lcrCountryId }) : undefined

	const record = {
		user,
		organization,
		orgService,
		orgLocation,
		language,
		lcrGovDist,
		lcrCountry,
		...scalarData,
	} satisfies Prisma.OrgReviewCreateArgs['data']

	return Prisma.validator<Prisma.OrgReviewCreateArgs>()({
		data: {
			...record,
			auditLogs: CreateAuditLog({ actorId: userId, operation: 'CREATE', to: data }),
		},
	})
})
