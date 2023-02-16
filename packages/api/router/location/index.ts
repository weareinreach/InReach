import { TRPCError } from '@trpc/server'

import { defineRouter, publicProcedure, handleError, staffProcedure } from '~api/lib'
import { id, orgId } from '~api/schemas/common'
import { CreateManyOrgLocationSchema, CreateOrgLocationSchema } from '~api/schemas/create/orgLocation'
import { orgLocationInclude } from '~api/schemas/selects/org'

export const locationRouter = defineRouter({
	byId: publicProcedure.input(id).query(async ({ ctx, input }) => {
		try {
			const location = await ctx.prisma.orgLocation.findUniqueOrThrow({
				where: {
					id: input.id,
				},
				...orgLocationInclude,
			})
			return location
		} catch (error) {
			handleError(error)
		}
	}),
	byOrg: publicProcedure.input(orgId).query(async ({ ctx, input }) => {
		try {
			const locations = await ctx.prisma.orgLocation.findMany({
				where: {
					orgId: input.orgId,
				},
			})
			if (locations.length === 0) throw new TRPCError({ code: 'NOT_FOUND' })
			return locations
		} catch (error) {
			handleError(error)
		}
	}),
	create: staffProcedure.input(CreateOrgLocationSchema().inputSchema).mutation(async ({ ctx, input }) => {
		try {
			const data = CreateOrgLocationSchema().dataParser.parse(input)

			const result = await ctx.prisma.orgLocation.create(data)

			return result
		} catch (error) {
			handleError(error)
		}
	}),
	createMany: staffProcedure
		.input(CreateManyOrgLocationSchema().inputSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				const records = CreateManyOrgLocationSchema().dataParser.parse({
					actorId: ctx.session.user.id,
					operation: 'CREATE',
					data: input,
				})
				const result = await ctx.prisma.$transaction(async (tx) => {
					const locations = await tx.orgLocation.createMany({
						data: records.data,
						skipDuplicates: true,
					})
					const auditLogs = await tx.auditLog.createMany({
						data: records.auditLogs,
						skipDuplicates: true,
					})
					return {
						locations: locations.count,
						auditLogs: auditLogs.count,
					}
				})
				return result
			} catch (error) {
				handleError(error)
			}
		}),
})
