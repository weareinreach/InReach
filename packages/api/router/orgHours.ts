import { TRPCError } from '@trpc/server'

import { getTz } from '~api/lib/getTz'
import { defineRouter, permissionedProcedure, staffProcedure } from '~api/lib/trpc'
import { coord } from '~api/schemas/common'
import { CreateAuditLog } from '~api/schemas/create/auditLog'
import { CreateManyOrgHours, CreateOrgHoursSchema, UpdateOrgHoursSchema } from '~api/schemas/create/orgHours'

export const orgHoursRouter = defineRouter({
	create: permissionedProcedure('createNewHours')
		.input(CreateOrgHoursSchema)
		.mutation(async ({ ctx, input }) => {
			const auditLogs = CreateAuditLog({ actorId: ctx.session.user.id, operation: 'CREATE', to: input })
			const newRecord = await ctx.prisma.orgHours.create({
				data: {
					...input,
					auditLogs,
				},
				select: { id: true },
			})
			return newRecord
		}),
	createMany: permissionedProcedure('createNewHours')
		.input(CreateManyOrgHours().inputSchema)
		.mutation(async ({ ctx, input }) => {
			const inputData = {
				actorId: ctx.session.user.id,
				operation: 'CREATE',
				data: input,
			}
			const { orgHours, auditLogs } = CreateManyOrgHours().dataParser.parse(inputData)
			const results = await ctx.prisma.$transaction(async (tx) => {
				const hours = await tx.orgHours.createMany(orgHours)
				const logs = await tx.auditLog.createMany(auditLogs)

				return { orgHours: hours.count, auditLogs: logs.count, balanced: hours.count === logs.count }
			})
			return results
		}),
	update: permissionedProcedure('updateHours')
		.input(UpdateOrgHoursSchema)
		.mutation(async ({ input, ctx }) => {
			const { where, data } = input
			const updatedRecord = await ctx.prisma.$transaction(async (tx) => {
				const current = await tx.orgHours.findUniqueOrThrow({ where })
				const auditLogs = CreateAuditLog({
					actorId: ctx.session.user.id,
					operation: 'UPDATE',
					from: current,
					to: data,
				})
				const updated = await tx.orgHours.update({
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
	getTz: staffProcedure.input(coord).query(({ input }) => {
		const result = getTz(input)
		if (!result) throw new TRPCError({ code: 'NOT_FOUND' })
		return result
	}),
})
