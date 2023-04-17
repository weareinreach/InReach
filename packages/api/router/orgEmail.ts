import { defineRouter, handleError, permissionedProcedure } from '~api/lib'
import { CreateAuditLog } from '~api/schemas/create/auditLog'
import { CreateOrgEmailSchema, UpdateOrgEmailSchema } from '~api/schemas/create/orgEmail'

export const orgEmailRouter = defineRouter({
	create: permissionedProcedure
		.meta({ hasPerm: 'editSingleOrg' })
		.input(CreateOrgEmailSchema)
		.mutation(async ({ ctx, input }) => {
			const auditLogs = CreateAuditLog({ actorId: ctx.session.user.id, operation: 'CREATE', to: input })
			const newEmail = await ctx.prisma.orgEmail.create({
				data: {
					...input,
					auditLogs,
				},
				select: { id: true },
			})
			return newEmail
		}),
	update: permissionedProcedure
		.meta({ hasPerm: 'editSingleOrg' })
		.input(UpdateOrgEmailSchema)
		.mutation(async ({ ctx, input }) => {
			const { where, data } = input
			const updatedRecord = await ctx.prisma.$transaction(async (tx) => {
				const current = await tx.orgEmail.findUniqueOrThrow({ where })
				const auditLogs = CreateAuditLog({
					actorId: ctx.session.user.id,
					operation: 'UPDATE',
					from: current,
					to: data,
				})
				const updated = await tx.orgEmail.update({
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
