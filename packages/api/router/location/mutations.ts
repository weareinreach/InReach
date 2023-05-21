import { handleError } from '~api/lib/errorHandler'
import { updateGeo } from '~api/lib/prismaRaw/updateGeo'
import { defineRouter, permissionedProcedure } from '~api/lib/trpc'
import { CreateAuditLog } from '~api/schemas/create/auditLog'
import {
	CreateManyOrgLocationSchema,
	CreateOrgLocationSchema,
	EditOrgLocationSchema,
} from '~api/schemas/create/orgLocation'

export const mutations = defineRouter({
	create: permissionedProcedure('createNewLocation')
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
	createMany: permissionedProcedure('createManyNewLocation')
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
	update: permissionedProcedure('updateLocation')
		.input(EditOrgLocationSchema)
		.mutation(async ({ ctx, input }) => {
			const { where, data } = input
			const updatedRecord = await ctx.prisma.$transaction(async (tx) => {
				const current = await tx.orgLocation.findUniqueOrThrow({ where })
				const auditLog = CreateAuditLog({
					actorId: ctx.session.user.id,
					operation: 'UPDATE',
					from: current,
					to: data,
				})
				const update = await tx.orgLocation.update({
					where,
					data: { ...data, auditLogs: auditLog },
					select: { id: true },
				})

				// if WKT is updated, we need to have the DB update the `geo` column with raw SQL.
				if (data.geoWKT) await updateGeo('orgLocation', where.id, tx)

				return update
			})
			return updatedRecord
		}),
})
