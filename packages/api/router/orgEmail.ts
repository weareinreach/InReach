import { z } from 'zod'

import { defineRouter, permissionedProcedure } from '~api/lib'
import { CreateAuditLog } from '~api/schemas/create/auditLog'
import { CreateOrgEmailSchema, UpdateOrgEmailSchema } from '~api/schemas/create/orgEmail'

export const orgEmailRouter = defineRouter({
	create: permissionedProcedure('createNewEmail')
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
	update: permissionedProcedure('updateEmail')
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
	get: permissionedProcedure('createNewEmail')
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

			const result = await ctx.prisma.orgEmail.findMany({
				where: {
					id,
					...(organizationId ? { organization: { some: { organizationId } } } : {}),
					...(orgLocationId ? { locations: { some: { orgLocationId } } } : {}),
					...(serviceId ? { services: { some: { serviceId } } } : {}),
				},
				select: {
					id: true,
					email: true,
					firstName: true,
					lastName: true,
					titleId: true,
					primary: true,
					published: true,
					deleted: true,
					description: { select: { tsKey: { select: { text: true } } } },
					locations: { select: { location: { select: { id: true, name: true } } } },
					organization: { select: { organization: { select: { id: true, name: true, slug: true } } } },
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
				({ description, locations, organization, titleId, services, ...record }) => ({
					...record,
					description: description?.tsKey.text,
					locations: locations.map(({ location }) => ({ ...location })),
					organization: organization.map(({ organization }) => ({ ...organization })),
					title: titleId,
					services: services.map(({ service }) => ({
						id: service.id,
						serviceName: service.serviceName?.tsKey.text,
					})),
				})
			)
			return transformedResult
		}),
	upsertMany: permissionedProcedure('updateEmail')
		.input(z.object({ orgSlug: z.string(), data: z.record(z.any()).array() }))
		.mutation(async ({ ctx, input }) => {
			return []
		}),
})
