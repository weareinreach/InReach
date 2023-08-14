import { z } from 'zod'

import { generateId, Prisma } from '@weareinreach/db'
import { userTypes } from '@weareinreach/db/generated/userType'
import { CreateBase } from '~api/schemaBase/create'
import { GenerateAuditLog } from '~api/schemas/create/auditLog'
import { prefixedId } from '~api/schemas/idPrefix'
import { connectOne, connectOneRequired, createManyRequired, linkManyWithAudit } from '~api/schemas/nestedOps'

export const ZAdminCreateSchema = () => {
	const { dataParser: parser, inputSchema } = CreateBase(
		z.object({
			id: prefixedId('user').default(generateId('user')),
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
				.union([
					z.object({ id: prefixedId('country') }),
					z.object({ cca2: z.string().length(2) }),
					z.object({ cca3: z.string().length(3) }),
				])
				.optional(),
			/** Requires either `id` or `slug` */
			currentGovDist: z
				.union([z.object({ id: prefixedId('govDist') }), z.object({ slug: z.string() })])
				.optional(),
			cognitoMessage: z.string().default('Confirm your account'),
			cogintoSubject: z.string().default('Click the following link to confirm your account:'),
			lawPractice: z.string().optional(),
			otherLawPractice: z.string().optional(),
			servProvider: z.string().optional(),
			servProviderOther: z.string().optional(),
			// Admin fields
			userType: z.enum(userTypes),
			permissions: z
				.object({ permissionId: prefixedId('permission') })
				.array()
				.optional(),
			orgPermission: z
				.object({
					permissionId: prefixedId('permission'),
					organizationId: prefixedId('organization'),
					authorized: z.boolean().default(false),
				})
				.array()
				.optional(),
			locationPermission: z
				.object({
					permissionId: prefixedId('permission'),
					orgLocationId: prefixedId('orgLocation'),
					authorized: z.boolean().default(false),
				})
				.array()
				.optional(),
			roles: z
				.object({
					roleId: prefixedId('userRole'),
				})
				.array()
				.optional(),
		})
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
					auditLogs: createManyRequired([
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
				message: cognitoMessage,
				subject: cogintoSubject,
			},
		}
	})
	return { dataParser, inputSchema }
}
export type TAdminCreateSchema = z.infer<ReturnType<typeof ZAdminCreateSchema>['inputSchema']>
