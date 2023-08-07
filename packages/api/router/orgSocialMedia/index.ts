import { z } from 'zod'

import { getIdPrefixRegex, isIdFor, type Prisma } from '@weareinreach/db'
import { defineRouter, permissionedProcedure, publicProcedure } from '~api/lib/trpc'
import { CreateAuditLog } from '~api/schemas/create/auditLog'
import { CreateOrgSocialSchema, UpdateOrgSocialSchema } from '~api/schemas/create/orgSocialMedia'
import { isPublic } from '~api/schemas/selects/common'

export const orgSocialMediaRouter = defineRouter({
	create: permissionedProcedure('createNewSocial')
		.input(CreateOrgSocialSchema)
		.mutation(async ({ ctx, input }) => {
			const auditLogs = CreateAuditLog({ actorId: ctx.session.user.id, operation: 'CREATE', to: input })
			const newSocial = await ctx.prisma.orgSocialMedia.create({
				data: {
					...input,
					auditLogs,
				},
				select: { id: true },
			})
			return newSocial
		}),
	update: permissionedProcedure('updateSocialMedia')
		.input(UpdateOrgSocialSchema)
		.mutation(async ({ input, ctx }) => {
			const { where, data } = input
			const updatedRecord = await ctx.prisma.$transaction(async (tx) => {
				const current = await tx.orgSocialMedia.findUniqueOrThrow({ where })
				const auditLogs = CreateAuditLog({
					actorId: ctx.session.user.id,
					operation: 'UPDATE',
					from: current,
					to: data,
				})
				const updated = await tx.orgSocialMedia.update({
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
				parentId: z.string().regex(getIdPrefixRegex('organization', 'orgLocation')),
				locationOnly: z.boolean().optional(),
			})
		)
		.query(async ({ ctx, input }) => {
			const whereId = (): Prisma.OrgSocialMediaWhereInput => {
				switch (true) {
					case isIdFor('organization', input.parentId): {
						return { organization: { id: input.parentId, ...isPublic } }
					}
					case isIdFor('orgLocation', input.parentId): {
						return { orgLocation: { id: input.parentId, ...isPublic } }
					}
					default: {
						return {}
					}
				}
			}

			const result = await ctx.prisma.orgSocialMedia.findMany({
				where: {
					...isPublic,
					...whereId(),
					...(input.locationOnly !== undefined ? { locationOnly: input.locationOnly } : {}),
				},
				select: {
					id: true,
					url: true,
					username: true,
					service: { select: { name: true } },
					orgLocationOnly: true,
				},
			})
			const transformed = result.map(({ service, ...record }) => ({
				...record,
				service: service?.name,
			}))
			return transformed
		}),
})
