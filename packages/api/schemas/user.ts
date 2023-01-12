import { z } from 'zod'

import { Prisma } from '@weareinreach/db'

const userTypes = ['seeker', 'provider', 'lcr', 'dataManager', 'dataAdmin', 'sysadmin', 'system'] as const

export const createUser = z.object({
	email: z.string().email(),
	password: z.string(),
	name: z.string().optional(),
})

export const adminCreateUser = createUser
	.extend({
		userType: z.enum(userTypes),
	})
	.transform((val) => ({
		...val,
		userType: {
			connect: {
				type: val.userType,
			},
		},
	}))

export const userSurvey = z
	.object({
		birthYear: z.number(),
		reasonForJoin: z.string(),
		communityIds: z.string().cuid().array(),
		ethnicityIds: z.string().cuid().array(),
		identifyIds: z.string().cuid().array(),
		countryOriginId: z.string().cuid(),
		immigrationId: z.string().cuid(),
		currentCity: z.string(),
		currentGovDistId: z.string().cuid(),
		currentCountryId: z.string().cuid(),
	})
	.partial()
type UserSurvey = z.infer<typeof userSurvey>

const createManyNested = <T>(data: T) => {
	return {
		createMany: {
			data,
			skipDuplicates: true,
		},
	}
}

export const transformUserSurvey = (input: UserSurvey): Prisma.UserSurveyCreateInput => {
	const communities = input.communityIds?.length
		? createManyNested(input.communityIds.map((id) => ({ communityId: id })))
		: undefined
	const ethnicities = input.ethnicityIds?.length
		? createManyNested(input.ethnicityIds.map((id) => ({ ethnicityId: id })))
		: undefined
	const identifiesAs = input.identifyIds?.length
		? createManyNested(input.identifyIds.map((id) => ({ sogId: id })))
		: undefined
	const countryOrigin = input.countryOriginId ? { connect: { id: input.countryOriginId } } : undefined
	const currentCountry = input.currentCountryId ? { connect: { id: input.currentCountryId } } : undefined
	const currentGovDist = input.currentGovDistId ? { connect: { id: input.currentGovDistId } } : undefined
	const immigration = input.immigrationId ? { connect: { id: input.immigrationId } } : undefined

	return {
		birthYear: input.birthYear,
		reasonForJoin: input.reasonForJoin,
		currentCity: input.currentCity,
		communities,
		ethnicities,
		identifiesAs,
		countryOrigin,
		currentCountry,
		currentGovDist,
		immigration,
	}
}
