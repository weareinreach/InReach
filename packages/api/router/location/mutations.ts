import { defineRouter, handleError, permissionedProcedure } from '~api/lib'
import { CreateManyOrgLocationSchema, CreateOrgLocationSchema } from '~api/schemas/create/orgLocation'

export const mutations = defineRouter({
	create: permissionedProcedure
		.meta({ hasPerm: 'createLocation' })
		.input(CreateOrgLocationSchema().inputSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				const data = CreateOrgLocationSchema().dataParser.parse(input)

				const result = await ctx.prisma.orgLocation.create(data)

				return result
			} catch (error) {
				handleError(error)
			}
		}),
	createMany: permissionedProcedure
		.meta({ hasPerm: 'createLocation' })
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
