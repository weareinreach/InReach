import { z } from 'zod'

import { Prisma } from '@weareinreach/db'
import { prefixedId } from '~api/schemas/idPrefix'
import { connectOne, createManyOptional } from '~api/schemas/nestedOps'

export const ZSubmitSurveySchema = z
	.object({
		birthYear: z.number(),
		reasonForJoin: z.string(),
		communityIds: prefixedId('userCommunity').array(),
		ethnicityIds: prefixedId('userEthnicity').array(),
		identifyIds: prefixedId('userSOGIdentity').array(),
		countryOriginId: prefixedId('country'),
		immigrationId: prefixedId('userImmigration'),
		currentCity: z.string(),
		currentGovDistId: prefixedId('govDist'),
		currentCountryId: prefixedId('country'),
		immigrationOther: z.string(),
		ethnicityOther: z.string(),
	})
	.partial()
	.transform(
		({
			communityIds,
			ethnicityIds,
			identifyIds,
			countryOriginId: countryOriginIdInput,
			currentCountryId: currentCountryIdInput,
			currentGovDistId: currentGovDistIdInput,
			immigrationId: immigrationIdInput,
			...rest
		}) => {
			const communityId = communityIds ? communityIds.map((communityId) => ({ communityId })) : undefined
			const ethnicityId = ethnicityIds ? ethnicityIds.map((ethnicityId) => ({ ethnicityId })) : undefined
			const sogId = identifyIds ? identifyIds.map((sogId) => ({ sogId })) : undefined
			const immigrationId = immigrationIdInput ? { id: immigrationIdInput } : undefined
			const countryOriginId = countryOriginIdInput ? { id: countryOriginIdInput } : undefined
			const currentCountryId = currentCountryIdInput ? { id: currentCountryIdInput } : undefined
			const currentGovDistId = currentGovDistIdInput ? { id: currentGovDistIdInput } : undefined
			return Prisma.validator<Prisma.UserSurveyCreateArgs>()({
				data: {
					...rest,
					communities: createManyOptional(communityId),
					ethnicities: createManyOptional(ethnicityId),
					identifiesAs: createManyOptional(sogId),
					immigration: connectOne(immigrationId),
					countryOrigin: connectOne(countryOriginId),
					currentCountry: connectOne(currentCountryId),
					currentGovDist: connectOne(currentGovDistId),
				},
				select: { id: true },
			})
		}
	)
export type TSubmitSurveySchema = z.infer<typeof ZSubmitSurveySchema>
