import { z } from 'zod'

import { getIdPrefixRegex, isIdFor, type Prisma } from '@weareinreach/db'
import { defineRouter, permissionedProcedure, publicProcedure } from '~api/lib/trpc'
import { CreateAuditLog } from '~api/schemas/create/auditLog'
import { CreateOrgWebsiteSchema, UpdateOrgWebsiteSchema } from '~api/schemas/create/orgWebsite'
import { isPublic } from '~api/schemas/selects/common'

export const orgWebsiteRouter = defineRouter({
	create: permissionedProcedure('createOrgWebsite')
		.input(CreateOrgWebsiteSchema)
		.mutation(async ({ ctx, input }) => {
			const auditLogs = CreateAuditLog({ actorId: ctx.session.user.id, operation: 'CREATE', to: input })
			const newRecord = await ctx.prisma.orgWebsite.create({
				data: {
					...input,
					auditLogs,
				},
				select: { id: true },
			})
			return newRecord
		}),
	update: permissionedProcedure('updateOrgWebsite')
		.input(UpdateOrgWebsiteSchema)
		.mutation(async ({ input, ctx }) => {
			const { where, data } = input
			const updatedRecord = await ctx.prisma.$transaction(async (tx) => {
				const current = await tx.orgWebsite.findUniqueOrThrow({ where })
				const auditLogs = CreateAuditLog({
					actorId: ctx.session.user.id,
					operation: 'UPDATE',
					from: current,
					to: data,
				})
				const updated = await tx.orgWebsite.update({
					where,
					data: {
						...data,
						auditLogs,
					},
				})
				return updated
			})
			return updatedRecord
		}),
	forContactInfo: publicProcedure
		.input(
			z.object({
				parentId: z.string().regex(getIdPrefixRegex('organization', 'orgLocation' /*, 'orgService'*/)),
				locationOnly: z.boolean().optional(),
			})
		)
		.query(async ({ ctx, input }) => {
			const whereId = (): Prisma.OrgWebsiteWhereInput => {
				switch (true) {
					case isIdFor('organization', input.parentId): {
						return { organization: { id: input.parentId, ...isPublic } }
					}
					case isIdFor('orgLocation', input.parentId): {
						return { orgLocation: { id: input.parentId, ...isPublic } }
					}
					// case isIdFor('orgService', input.parentId): {
					// 	return { services: { some: { service: { id: input.parentId, ...isPublic } } } }
					// }
					default: {
						return {}
					}
				}
			}

			const result = await ctx.prisma.orgWebsite.findMany({
				where: {
					...isPublic,
					...whereId(),
					...(input.locationOnly !== undefined ? { orgLocationOnly: input.locationOnly } : {}),
				},
				select: {
					id: true,
					url: true,
					isPrimary: true,
					description: { select: { tsKey: { select: { text: true, key: true } } } },
					orgLocationOnly: true,
				},
				orderBy: { isPrimary: 'desc' },
			})
			const transformed = result.map(({ description, ...record }) => ({
				...record,
				description: description
					? { key: description?.tsKey.key, defaultText: description?.tsKey.text }
					: null,
			}))
			return transformed
		}),
})
