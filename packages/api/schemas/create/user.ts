import { z } from 'zod'
import { Prisma, generateId } from '@weareinreach/db'

import { userTypes } from '~api/generated/userType'
import { decodeUrl } from '~api/lib'
import { idString, CreationBase, id, slug } from '~api/schemas/common'
import {
	connectOne,
	connectOneRequired,
	createManyOrUndefined,
	linkManyWithAudit,
	createMany,
} from '~api/schemas/nestedOps'

import { CreateAuditLog, GenerateAuditLog } from './auditLog'

const CreateUserBase = {
	id: idString.default(generateId('user')),
	email: z.string().email(),
	password: z.string(),
	name: z.string().optional(),
	image: z.string().url().optional(),
	active: z.boolean().optional(),
	currentCity: z.string().optional(),
	/** Defaults to `en` */
	language: z.string().default('en'),
	/**
	 * Requires either `id`, `cca2`, or `cca3`
	 *
	 * `cca2` = {@link https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2 ISO 3166-1 alpha-2 Country code}
	 *
	 * `cca3` = {@link https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3 ISO 3166-1 alpha-3 Country code}
	 */
	currentCountry: z
		.union([z.object({ id: idString }), z.object({ cca2: z.string() }), z.object({ cca3: z.string() })])
		.optional(),
	/** Requires either `id` or `slug` */
	currentGovDist: z.union([id, slug]).optional(),
	userType: z.string().default('seeker'),
	cognitoMessage: z.string().default('Confirm your account'),
	cogintoSubject: z.string().default('Click the following link to confirm your account:'),
}

export const CreateUser = z
	.object(CreateUserBase)
	.transform(({ id, name, email, password, image, active, currentCity, ...data }) => {
		const userType = connectOneRequired({ type: data.userType })
		const langPref = connectOne({ localeCode: data.language })
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

			cognito: {
				databaseId: id,
				email,
				password,
				message: data.cognitoMessage,
				subject: data.cogintoSubject,
			},
		}
	})

const adminCreateFields = {
	userType: z.enum(userTypes),
	permissions: z.object({ permissionId: idString }).array().optional(),
	orgPermission: z
		.object({ permissionId: idString, organizationId: idString, authorized: z.boolean().default(false) })
		.array()
		.optional(),
	locationPermission: z
		.object({ permissionId: idString, orgLocationId: idString, authorized: z.boolean().default(false) })
		.array()
		.optional(),
	roles: z
		.object({
			roleId: idString,
		})
		.array()
		.optional(),
}

export const AdminCreateUser = () => {
	const { dataParser: parser, inputSchema } = CreationBase(
		z.object({ ...CreateUserBase, ...adminCreateFields })
	)
	const dataParser = parser.transform(({ actorId, data, operation }) => {
		const { id, name, email, password, image, cogintoSubject, cognitoMessage } = data
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
		const langPref = connectOne({ localeCode: data.language })

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
			cognito: {
				databaseId: id,
				email,
				password,
				message: data.cognitoMessage,
				subject: data.cogintoSubject,
			},
		}
	})
	return { dataParser, inputSchema }
}
export type AdminCreateUserInput = z.input<ReturnType<typeof AdminCreateUser>['dataParser']>

export const CreateUserSurvey = z
	.object({
		birthYear: z.number(),
		reasonForJoin: z.string(),
		communityIds: idString.array(),
		ethnicityIds: idString.array(),
		identifyIds: idString.array(),
		countryOriginId: idString,
		immigrationId: idString,
		currentCity: z.string(),
		currentGovDistId: idString,
		currentCountryId: idString,
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

export const CognitoBase64 = z
	.object({
		data: z.string(),
		code: z.string(),
	})
	.transform(({ data, code }) => ({ code, ...decodeUrl(data) }))

export const ResetPassword = z
	.object({
		data: z.string(),
		code: z.string(),
		password: z.string(),
	})
	.transform(({ data, password, code }) => ({ password, code, ...decodeUrl(data) }))

export const ForgotPassword = z
	.object({
		email: z.string().email(),
		cognitoMessage: z.string(),
		cognitoSubject: z.string(),
	})
	.transform(({ email, cognitoMessage, cognitoSubject }) => ({
		email,
		subject: cognitoSubject,
		message: cognitoMessage,
	}))
