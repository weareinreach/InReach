import { CreateOrgPhotoSchema, UpdateOrgPhotoSchema } from 'schemas/create/orgPhoto'
import { defineRouter, handleError, permissionedProcedure } from '~api/lib'
import { CreateAuditLog } from '~api/schemas/create/auditLog'

export const orgPhotoRouter = defineRouter({
	create: permissionedProcedure
		.meta({ hasPerm: ['editAnyOrg', 'createOrg'] })
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
	update: permissionedProcedure
		.meta({ hasPerm: 'editSingleOrg' })
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
})
