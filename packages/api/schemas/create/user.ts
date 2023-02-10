import { Prisma, createId } from '@weareinreach/db'
import { z } from 'zod'

import { userTypes } from '~api/generated/userType'
import { cuid, CreationBase } from '~api/schemas/common'
import {
	connectOne,
	connectOneRequired,
	createManyOrUndefined,
	linkManyWithAudit,
	createMany,
} from '~api/schemas/nestedOps'

import { CreateAuditLog, GenerateAuditLog } from './auditLog'

const CreateUserBase = z.object({
	id: cuid.default(createId()),
	email: z.string().email(),
	password: z.string(),
	name: z.string().optional(),
	image: z.string().url().optional(),
	active: z.boolean().optional(),
	currentCity: z.string().optional(),
	/** Defaults to `en` */
	langPref: z.string().default('en'),
	/**
	 * Requires either `id`, `cca2`, or `cca3`
	 *
	 * `cca2` = {@link https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2 ISO 3166-1 alpha-2 Country code}
	 *
	 * `cca3` = {@link https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3 ISO 3166-1 alpha-3 Country code}
	 */
	currentCountry: z.object({ id: cuid, cca2: z.string(), cca3: z.string() }).partial().optional(),
	/** Requires either `id` or `slug` */
	currentGovDist: z.object({ id: cuid, slug: z.string() }).partial().optional(),
})

export const CreateUser = CreateUserBase.transform(
	({ id, name, email, password, image, active, currentCity, ...data }) => {
		const userType = connectOneRequired({ type: 'seeker' })
		const langPref = connectOne({ localeCode: data.langPref })
		const currentCountry = connectOne(data.currentCountry)
		const currentGovDist = connectOne(data.currentGovDist)
		const record = {
			id,
			name,
			email,
			image,
			userType,
			langPref,
			currentCity,
			currentCountry,
			currentGovDist,
		} satisfies Prisma.UserCreateArgs['data']

		return {
			prisma: Prisma.validator<Prisma.UserCreateArgs>()({
				data: {
					...record,
					auditLogs: CreateAuditLog({
						actorId: id,
						operation: 'CREATE',
						to: record,
					}),
				},
				select: { id: true },
			}),

			cognito: { databaseId: id, email, password },
		}
	}
)

const adminCreateFields = z
	.object({
		userType: z.enum(userTypes),
		permissions: z.object({ permissionId: cuid }).array(),
		orgPermission: z
			.object({ permissionId: cuid, organizationId: cuid, authorized: z.boolean().default(false) })
			.array(),
		locationPermission: z
			.object({ permissionId: cuid, orgLocationId: cuid, authorized: z.boolean().default(false) })
			.array(),
		roles: z
			.object({
				roleId: cuid,
			})
			.array(),
	})
	.partial()

export const AdminCreateUser = () => {
	const { dataParser: parser, inputSchema } = CreationBase(CreateUserBase.merge(adminCreateFields))
	const dataParser = parser.transform(({ actorId, data, operation }) => {
		const { id, name, email, password, image } = data
		const [permissions, permissionLogs] = linkManyWithAudit(data?.permissions, actorId)
		const [orgPermission, orgPermissionLogs] = linkManyWithAudit(data?.orgPermission, actorId, {
			auditDataKeys: ['authorized'],
		})
		const [locationPermission, locationPermissionLogs] = linkManyWithAudit(
			data?.locationPermission,
			actorId,
			{ auditDataKeys: ['authorized'] }
		)
		const [roles, rolesLogs] = linkManyWithAudit(data?.roles, actorId)
		const userType = connectOneRequired({ type: data.userType })
		const langPref = connectOne({ localeCode: data.langPref })

		const scalarData = {
			id,
			name,
			email,
			image,
			langPref,
			userType,
		} satisfies Prisma.UserCreateInput

		return {
			prisma: Prisma.validator<Prisma.UserCreateArgs>()({
				data: {
					...scalarData,
					permissions,
					roles,
					orgPermission,
					locationPermission,
					auditLogs: createMany([
						GenerateAuditLog({
							actorId,
							operation,
							to: scalarData,
						}),
						...permissionLogs,
						...rolesLogs,
						...orgPermissionLogs,
						...locationPermissionLogs,
					]),
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
		communityIds: cuid.array(),
		ethnicityIds: cuid.array(),
		identifyIds: cuid.array(),
		countryOriginId: cuid,
		immigrationId: cuid,
		currentCity: z.string(),
		currentGovDistId: cuid,
		currentCountryId: cuid,
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
