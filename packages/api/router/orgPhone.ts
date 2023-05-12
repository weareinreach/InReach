import { z } from 'zod'

import { defineRouter, permissionedProcedure } from '~api/lib'
import { CreateAuditLog } from '~api/schemas/create/auditLog'
import { CreateOrgPhoneSchema, UpdateOrgPhoneSchema } from '~api/schemas/create/orgPhone'

export const orgPhoneRouter = defineRouter({
	create: permissionedProcedure('createNewPhone')
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
	update: permissionedProcedure('updatePhone')
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
	get: permissionedProcedure('createNewPhone')
		.input(
			z
				.object({
					id: z.string(),
					organizationId: z.string(),
					orgLocationId: z.string(),
					serviceId: z.string(),
				})
				.partial()
		)
		.query(async ({ ctx, input }) => {
			const { id, orgLocationId, organizationId, serviceId } = input

			const result = await ctx.prisma.orgPhone.findMany({
				where: {
					id,
					...(organizationId ? { organization: { organizationId } } : {}),
					...(orgLocationId ? { locations: { some: { orgLocationId } } } : {}),
					...(serviceId ? { services: { some: { serviceId } } } : {}),
				},
				select: {
					id: true,
					number: true,
					ext: true,
					deleted: true,
					primary: true,
					published: true,
					country: { select: { cca2: true } },
					description: { select: { tsKey: { select: { text: true } } } },
					locations: { select: { location: { select: { id: true, name: true } } } },
					organization: { select: { organization: { select: { id: true, name: true, slug: true } } } },
					phoneType: { select: { id: true, type: true, tsKey: true, tsNs: true } },
					services: {
						select: {
							service: {
								select: {
									id: true,
									serviceName: { select: { tsKey: { select: { text: true } } } },
								},
							},
						},
					},
				},
				orderBy: [{ published: 'desc' }, { deleted: 'desc' }],
			})

			const transformedResult = result.map(
				({ country, description, locations, organization, phoneType, services, ...record }) => ({
					...record,
					country: country.cca2,
					description: description?.tsKey.text,
					locations: locations?.map(({ location }) => ({ ...location })),
					organization: { ...organization?.organization },
					phoneType,
					services: services?.map(({ service }) => ({
						id: service.id,
						serviceName: service.serviceName?.tsKey.text,
					})),
				})
			)
			return transformedResult
		}),
})
