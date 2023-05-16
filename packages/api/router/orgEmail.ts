import compact from 'just-compact'
import { z } from 'zod'

import { generateId, generateNestedFreeText } from '@weareinreach/db'
import { defineRouter, permissionedProcedure } from '~api/lib'
import { CreateAuditLog } from '~api/schemas/create/auditLog'
import {
	CreateOrgEmailSchema,
	UpdateOrgEmailSchema,
	UpsertManyOrgEmailSchema,
} from '~api/schemas/create/orgEmail'
import {
	connectOneId,
	connectOrDisconnectId,
	createManyOptional,
	diffConnectionsMtoN,
} from '~api/schemas/nestedOps'

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
		.input(UpsertManyOrgEmailSchema)
		.mutation(async ({ ctx, input }) => {
			const { orgSlug, data } = input

			const existing = await ctx.prisma.orgEmail.findMany({
				where: {
					id: { in: compact(data.map(({ id }) => id)) },
				},
				include: { services: true, locations: true },
			})
			const upserts = await ctx.prisma.$transaction(
				data.map(
					({
						title,
						services: servicesArr,
						locations: locationsArr,
						description,
						id: passedId,
						...record
					}) => {
						const before = passedId ? existing.find(({ id }) => id === passedId) : undefined
						const servicesBefore = before?.services.map(({ serviceId }) => ({ serviceId })) ?? []
						const locationsBefore = before?.locations.map(({ orgLocationId }) => ({ orgLocationId })) ?? []
						const auditLogs = CreateAuditLog({
							actorId: ctx.actorId,
							operation: before ? 'UPDATE' : 'CREATE',
							from: before,
							to: record,
						})
						const id = passedId ?? generateId('orgEmail')

						const services = servicesArr.map((serviceId) => ({ serviceId }))
						const locations = locationsArr.map((orgLocationId) => ({ orgLocationId }))

						return ctx.prisma.orgEmail.upsert({
							where: { id },
							create: {
								id,
								...record,
								title: connectOneId(title),
								services: createManyOptional(services),
								locations: createManyOptional(locations),
								auditLogs,
								description: description
									? generateNestedFreeText({ orgSlug, text: description, type: 'emailDesc', itemId: id })
									: undefined,
							},
							update: {
								id,
								...record,
								title: connectOrDisconnectId(title),
								services: diffConnectionsMtoN(services, servicesBefore, 'serviceId'),
								locations: diffConnectionsMtoN(locations, locationsBefore, 'orgLocationId'),
								description: description
									? {
											upsert: {
												...generateNestedFreeText({
													orgSlug,
													text: description,
													type: 'emailDesc',
													itemId: id,
												}),
												update: { tsKey: { update: { text: description } } },
											},
									  }
									: undefined,
								auditLogs,
							},
						})
					}
				)
			)
			return upserts
		}),
})
