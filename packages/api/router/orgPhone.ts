import { defineRouter, handleError, permissionedProcedure } from '~api/lib'
import { CreateAuditLog } from '~api/schemas/create/auditLog'
import { CreateOrgPhoneSchema, UpdateOrgPhoneSchema } from '~api/schemas/create/orgPhone'

export const orgPhoneRouter = defineRouter({
	create: permissionedProcedure('createNewEmail')
		.input(CreateOrgPhoneSchema)
		.mutation(async ({ ctx, input }) => {
			const auditLogs = CreateAuditLog({ actorId: ctx.session.user.id, operation: 'CREATE', to: input })
			const newPhone = await ctx.prisma.orgPhone.create({
				data: {
					...input,
					auditLogs,
				},
				select: { id: true },
			})
			return newPhone
		}),
	update: permissionedProcedure('updateEmail')
		.input(UpdateOrgPhoneSchema)
		.mutation(async ({ input, ctx }) => {
			const { where, data } = input
			const updatedRecord = await ctx.prisma.$transaction(async (tx) => {
				const current = await tx.orgPhone.findUniqueOrThrow({ where })
				const auditLogs = CreateAuditLog({
					actorId: ctx.session.user.id,
					operation: 'UPDATE',
					from: current,
					to: data,
				})
				const updated = await tx.orgPhone.update({
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
