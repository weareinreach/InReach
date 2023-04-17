import { defineRouter, handleError, permissionedProcedure } from '~api/lib'
import { CreateAuditLog } from '~api/schemas/create/auditLog'
import { CreateOrgWebsiteSchema, UpdateOrgWebsiteSchema } from '~api/schemas/orgWebsite'

export const orgWebsiteRouter = defineRouter({
	create: permissionedProcedure
		.meta({ hasPerm: ['editAnyOrg', 'createOrg'] })
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
	update: permissionedProcedure
		.meta({ hasPerm: 'editSingleOrg' })
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
})
