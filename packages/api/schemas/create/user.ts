import { Prisma, createId } from '@weareinreach/db'
import { z } from 'zod'

import {
	cuid,
	connectOne,
	connectOneRequired,
	CreationBase,
	createManyOrUndefined,
} from '~api/schemas/common'

import { CreateAuditLog } from './auditLog'

import { userTypes } from '~api/generated/userType'

const CreateUserBase = z.object({
	id: cuid.default(createId()),
	email: z.string().email(),
	password: z.string(),
	name: z.string().optional(),
	image: z.string().url().optional(),
	active: z.boolean().optional(),
	langPref: z.string(),
})

export const CreateUser = CreateUserBase.transform(({ id, name, email, password, langPref, image }) => {
	return {
		prisma: Prisma.validator<Prisma.UserCreateArgs>()({
			data: {
				id,
				name,
				email,
				image,
				userType: connectOneRequired({ type: 'seeker' }),
				langPref: connectOne({ localeCode: langPref }),
				auditLogs: CreateAuditLog({
					actorId: id,
					operation: 'CREATE',
					to: { id, name, email, image, langPref },
				}),
			},
			select: { id: true },
		}),

		cognito: { databaseId: id, email, password },
	}
})

export const AdminCreateUser = () => {
	const { dataParser: parser, inputSchema } = CreationBase(
		CreateUserBase.extend({ userType: z.enum(userTypes) })
	)
	const dataParser = parser.transform(({ actorId, data, operation }) => {
		const { id, name, email, password, langPref, image, userType } = data
		return {
			prisma: Prisma.validator<Prisma.UserCreateArgs>()({
				data: {
					id,
					name,
					email,
					image,
					userType: connectOneRequired({ type: userType }),
					langPref: connectOne({ localeCode: langPref }),
					auditLogs: CreateAuditLog({
						actorId,
						operation,
						to: { id, name, email, image, langPref },
					}),
				},
				select: { id: true },
			}),
			cognito: { databaseId: id, email, password },
		}
	})
	return { dataParser, inputSchema }
}
export type AdminCreateUserInput = z.input<ReturnType<typeof AdminCreateUser>['dataParser']>

export const CreateUserSurvey = z
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
					communities: createManyOrUndefined(communityId),
					ethnicities: createManyOrUndefined(ethnicityId),
					identifiesAs: createManyOrUndefined(sogId),
					immigration: connectOne(immigrationId),
					countryOrigin: connectOne(countryOriginId),
					currentCountry: connectOne(currentCountryId),
					currentGovDist: connectOne(currentGovDistId),
				},
				select: { id: true },
			})
		}
	)
