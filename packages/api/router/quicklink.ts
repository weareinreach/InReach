import flush from 'just-flush'
import { z } from 'zod'

import { type Prisma } from '@weareinreach/db'
import { defineRouter, permissionedProcedure, publicProcedure } from '~api/lib/trpc'
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
				phones: { some: { phone: { AND: [{ locations: { none: {} } }, { services: { none: {} } }] } } },
			} satisfies Prisma.OrganizationWhereInput

			const data = await ctx.prisma.organization.findMany({
				where,
				select: {
					id: true,
					name: true,
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
			const transformedData = data.flatMap(({ locations, phones, services, id, name }) =>
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
						})
						.partial(),
					to: z.object({
						serviceOnly: z.boolean().optional(),
						locationOnly: z.boolean().optional(),
						locations: z.object({ add: z.string().array(), del: z.string().array() }).partial(),
						services: z.object({ add: z.string().array(), del: z.string().array() }).partial(),
					}),
				})
				.array()
		)
		.mutation(async ({ ctx, input }) => {
			const updates = input.map(({ id, from, to }) => {
				const { serviceOnly, locationOnly, locations, services } = to
				const auditLogs = CreateAuditLog({ actorId: ctx.actorId, operation: 'UPDATE', from, to: flush(to) })
				return ctx.prisma.orgPhone.update({
					where: { id },
					data: {
						serviceOnly,
						locationOnly,
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
})
