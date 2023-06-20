import { z } from 'zod'

import { getIdPrefixRegex, isIdFor, type Prisma } from '@weareinreach/db'
import { defineRouter, permissionedProcedure, publicProcedure } from '~api/lib/trpc'
import { CreateAuditLog } from '~api/schemas/create/auditLog'
import { CreateOrgPhotoSchema, UpdateOrgPhotoSchema } from '~api/schemas/create/orgPhoto'
import { isPublic } from '~api/schemas/selects/common'

export const orgPhotoRouter = defineRouter({
	create: permissionedProcedure('createPhoto')
		.input(CreateOrgPhotoSchema)
		.mutation(async ({ ctx, input }) => {
			const auditLogs = CreateAuditLog({ actorId: ctx.session.user.id, operation: 'CREATE', to: input })
			const newRecord = await ctx.prisma.orgPhoto.create({
				data: {
					...input,
					auditLogs,
				},
				select: { id: true },
			})
			return newRecord
		}),
	update: permissionedProcedure('updatePhoto')
		.input(UpdateOrgPhotoSchema)
		.mutation(async ({ input, ctx }) => {
			const { where, data } = input
			const updatedRecord = await ctx.prisma.$transaction(async (tx) => {
				const current = await tx.orgPhoto.findUniqueOrThrow({ where })
				const auditLogs = CreateAuditLog({
					actorId: ctx.session.user.id,
					operation: 'UPDATE',
					from: current,
					to: data,
				})
				const updated = await tx.orgPhoto.update({
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
	getByParent: publicProcedure
		.input(z.string().regex(getIdPrefixRegex('organization', 'orgLocation')))
		.query(async ({ input, ctx }) => {
			const whereId = (): Prisma.OrgPhotoWhereInput => {
				switch (true) {
					case isIdFor('organization', input): {
						return { organization: { id: input, ...isPublic } }
					}
					case isIdFor('orgLocation', input): {
						return { orgLocation: { id: input, ...isPublic } }
					}
					default: {
						return {}
					}
				}
			}
			const result = await ctx.prisma.orgPhoto.findMany({
				where: {
					...isPublic,
					...whereId(),
				},
				select: {
					id: true,
					src: true,
					height: true,
					width: true,
				},
			})
			return result
		}),
})
