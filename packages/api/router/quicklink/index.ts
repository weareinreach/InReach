import flush from 'just-flush'
import { z } from 'zod'

import { type Prisma } from '@weareinreach/db/client'
import { defineRouter, permissionedProcedure } from '~api/lib/trpc'
import { CreateAuditLog } from '~api/schemas/create/auditLog'

const phoneSelect = {
	select: {
		phone: {
			select: {
				id: true,
				number: true,
				description: { select: { tsKey: { select: { text: true } } } },
				country: { select: { id: true, cca2: true } },
				locationOnly: true,
				serviceOnly: true,
				locations: { select: { location: { select: { id: true } } } },
				services: { select: { service: { select: { id: true } } } },
				published: true,
			},
		},
	},
} satisfies Prisma.Organization$phonesArgs

export const quickLinkRouter = defineRouter({
	getPhoneData: permissionedProcedure('updateLocation')
		.input(z.object({ limit: z.number(), skip: z.number().optional() }))
		.query(async ({ ctx, input }) => {
			const limit = input.limit ?? 20
			const { skip } = input

			const where = {
				published: true,
				deleted: false,
				phones: {
					some: {
						phone: { AND: [{ locations: { none: {} } }, { services: { none: {} } }, { published: true }] },
					},
				},
			} satisfies Prisma.OrganizationWhereInput

			const data = await ctx.prisma.organization.findMany({
				where,
				select: {
					id: true,
					name: true,
					slug: true,
					locations: {
						select: {
							id: true,
							name: true,
							// phones: { select: { phone: { select: { id: true } } } },
						},
					},
					phones: phoneSelect,
					services: {
						select: {
							id: true,
							serviceName: { select: { tsKey: { select: { text: true } } } },
							// phones: { select: { phone: { select: { id: true } } } },
						},
					},
				},
				orderBy: { id: 'asc' },
				take: limit, // + 1,
				skip,
			})
			const totalResults = await ctx.prisma.organization.count({ where })
			const transformedData = data.flatMap(({ locations, phones, services, id, name, slug }) =>
				phones.map(({ phone }) => {
					const {
						description,
						id: phoneId,
						locations: attachedLocations,
						services: attachedServices,
						...rest
					} = phone
					return {
						orgId: id,
						name,
						slug,
						phoneId,
						...rest,
						description: description?.tsKey.text,
						attachedLocations: attachedLocations.map(({ location }) => location.id),
						attachedServices: attachedServices.map(({ service }) => service.id),
						locations,
						services,
					}
				})
			)
			return {
				results: transformedData,
				totalResults,
			}
		}),
	updatePhoneData: permissionedProcedure('updateLocation')
		.input(
			z
				.object({
					id: z.string(),
					from: z
						.object({
							serviceOnly: z.boolean().optional(),
							locationOnly: z.boolean().optional(),
							locations: z.string().array(),
							services: z.string().array(),
							published: z.boolean().optional(),
						})
						.partial(),
					to: z.object({
						serviceOnly: z.boolean().optional(),
						locationOnly: z.boolean().optional(),
						locations: z.object({ add: z.string().array(), del: z.string().array() }).partial(),
						services: z.object({ add: z.string().array(), del: z.string().array() }).partial(),
						published: z.boolean().optional(),
					}),
				})
				.array()
		)
		.mutation(async ({ ctx, input }) => {
			const updates = input.map(({ id, from, to }) => {
				const { serviceOnly, locationOnly, locations, services, published } = to
				const auditLogs = CreateAuditLog({ actorId: ctx.actorId, operation: 'UPDATE', from, to: flush(to) })
				return ctx.prisma.orgPhone.update({
					where: { id },
					data: {
						serviceOnly,
						locationOnly,
						published,
						locations: {
							createMany: locations.add?.length
								? { data: locations.add.map((orgLocationId) => ({ orgLocationId })), skipDuplicates: true }
								: undefined,
							deleteMany: locations.del?.length ? { orgLocationId: { in: locations.del } } : undefined,
						},
						services: {
							createMany: services.add?.length
								? { data: services.add.map((serviceId) => ({ serviceId })), skipDuplicates: true }
								: undefined,
							deleteMany: services.del?.length ? { serviceId: { in: services.del } } : undefined,
						},
						auditLogs,
					},
				})
			})
			const results = await ctx.prisma.$transaction(updates)
			return results
		}),
	getEmailData: permissionedProcedure('updateLocation')
		.input(z.object({ limit: z.number(), skip: z.number().optional() }))
		.query(async ({ ctx, input }) => {
			const limit = input.limit ?? 20
			const { skip } = input

			const where = {
				published: true,
				deleted: false,
				emails: {
					some: {
						email: { AND: [{ locations: { none: {} } }, { services: { none: {} } }, { published: true }] },
					},
				},
			} satisfies Prisma.OrganizationWhereInput

			const data = await ctx.prisma.organization.findMany({
				where,
				select: {
					id: true,
					name: true,
					slug: true,
					locations: { select: { id: true, name: true } },
					services: {
						select: {
							id: true,
							serviceName: { select: { tsKey: { select: { text: true } } } },
						},
					},
					emails: {
						select: {
							email: {
								select: {
									id: true,
									email: true,
									firstName: true,
									lastName: true,
									locationOnly: true,
									serviceOnly: true,
									published: true,
									description: { select: { tsKey: { select: { text: true } } } },
									locations: { select: { location: { select: { id: true } } } },
									services: { select: { service: { select: { id: true } } } },
								},
							},
						},
					},
				},
				orderBy: { id: 'asc' },
				take: limit, // + 1,
				skip,
			})
			const totalResults = await ctx.prisma.organization.count({ where })
			const transformedData = data.flatMap(({ locations, emails, services, id, name, slug }) =>
				emails.map(({ email }) => {
					const {
						description,
						id: emailId,
						locations: attachedLocations,
						services: attachedServices,
						...rest
					} = email
					return {
						orgId: id,
						name,
						slug,
						emailId,
						...rest,
						description: description?.tsKey.text,
						attachedLocations: attachedLocations.map(({ location }) => location.id),
						attachedServices: attachedServices.map(({ service }) => service.id),
						locations,
						services,
					}
				})
			)
			return {
				results: transformedData,
				totalResults,
			}
		}),
	updateEmailData: permissionedProcedure('updateLocation')
		.input(
			z
				.object({
					id: z.string(),
					from: z
						.object({
							serviceOnly: z.boolean().optional(),
							locationOnly: z.boolean().optional(),
							published: z.boolean().optional(),
							locations: z.string().array(),
							services: z.string().array(),
						})
						.partial(),
					to: z.object({
						serviceOnly: z.boolean().optional(),
						locationOnly: z.boolean().optional(),
						published: z.boolean().optional(),
						locations: z.object({ add: z.string().array(), del: z.string().array() }).partial(),
						services: z.object({ add: z.string().array(), del: z.string().array() }).partial(),
					}),
				})
				.array()
		)
		.mutation(async ({ ctx, input }) => {
			const updates = input.map(({ id, from, to }) => {
				const { serviceOnly, locationOnly, locations, services, published } = to
				const auditLogs = CreateAuditLog({ actorId: ctx.actorId, operation: 'UPDATE', from, to: flush(to) })
				return ctx.prisma.orgEmail.update({
					where: { id },
					data: {
						serviceOnly,
						locationOnly,
						published,
						locations: {
							createMany: locations.add?.length
								? { data: locations.add.map((orgLocationId) => ({ orgLocationId })), skipDuplicates: true }
								: undefined,
							deleteMany: locations.del?.length ? { orgLocationId: { in: locations.del } } : undefined,
						},
						services: {
							createMany: services.add?.length
								? { data: services.add.map((serviceId) => ({ serviceId })), skipDuplicates: true }
								: undefined,
							deleteMany: services.del?.length ? { serviceId: { in: services.del } } : undefined,
						},
						auditLogs,
					},
				})
			})
			const results = await ctx.prisma.$transaction(updates)
			return results
		}),
	getServiceLocationData: permissionedProcedure('updateLocation')
		.input(z.object({ limit: z.number(), skip: z.number().optional() }))
		.query(async ({ ctx, input }) => {
			const limit = input.limit ?? 20
			const { skip } = input

			const where = {
				published: true,
				deleted: false,
				locations: {
					some: { services: { none: {} }, published: true },
				},
			} satisfies Prisma.OrganizationWhereInput
			const results = await ctx.prisma.organization.findMany({
				where,
				select: {
					id: true,
					name: true,
					slug: true,
					locations: {
						select: {
							id: true,
							name: true,
							published: true,
							services: {
								select: {
									service: {
										select: { id: true, serviceName: { select: { tsKey: { select: { text: true } } } } },
									},
								},
							},
						},
						where: { services: { none: {} }, published: true, deleted: false },
					},
					services: {
						select: {
							id: true,
							serviceName: { select: { tsKey: { select: { text: true } } } },
						},
					},
				},
				orderBy: { id: 'asc' },
				take: limit, // + 1,
				skip,
			})
			const totalResults = await ctx.prisma.organization.count({ where })
			const transformedData = results.flatMap(({ locations, services, id, name, slug }) =>
				locations.map(({ id: locationId, name: locationName, services: locationServices, published }) => {
					return {
						orgId: id,
						name,
						slug,
						locationId,
						locationName,
						published,
						attachedServices: locationServices.map(({ service }) => service.id),
						services,
					}
				})
			)
			return {
				results: transformedData,
				totalResults,
			}
		}),
	updateServiceLocationData: permissionedProcedure('updateLocation')
		.input(
			z
				.object({
					id: z.string(),
					from: z
						.object({
							services: z.string().array(),
							published: z.boolean().optional(),
						})
						.partial(),
					to: z.object({
						services: z.object({ add: z.string().array(), del: z.string().array() }).partial(),
						published: z.boolean().optional(),
					}),
				})
				.array()
		)
		.mutation(async ({ ctx, input }) => {
			const updates = input.map(({ id, from, to }) => {
				const { services, published } = to
				const auditLogs = CreateAuditLog({ actorId: ctx.actorId, operation: 'UPDATE', from, to: flush(to) })
				return ctx.prisma.orgLocation.update({
					where: { id },
					data: {
						published,
						services: {
							createMany: services.add?.length
								? { data: services.add.map((serviceId) => ({ serviceId })), skipDuplicates: true }
								: undefined,
							deleteMany: services.del?.length ? { serviceId: { in: services.del } } : undefined,
						},
						auditLogs,
					},
				})
			})
			const results = await ctx.prisma.$transaction(updates)
			return results
		}),
})
