import compact from 'just-compact'
import { z } from 'zod'

import { getIdPrefixRegex, isIdFor, type Prisma } from '@weareinreach/db'
import { generateNestedFreeText } from '@weareinreach/db/lib/generateFreeText'
import { defineRouter, permissionedProcedure, publicProcedure } from '~api/lib/trpc'
import { CreateAuditLog } from '~api/schemas/create/auditLog'
import {
	CreateOrgPhoneSchema,
	UpdateOrgPhoneSchema,
	UpsertManyOrgPhoneSchema,
} from '~api/schemas/create/orgPhone'
import {
	connectOneId,
	connectOneIdRequired,
	connectOrDisconnectId,
	createManyOptional,
	diffConnectionsMtoN,
} from '~api/schemas/nestedOps'
import { isPublic } from '~api/schemas/selects/common'

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
					country: { select: { cca2: true, id: true } },
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
				({ description, locations, organization, phoneType, services, ...record }) => ({
					...record,
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
	upsertMany: permissionedProcedure('updatePhone')
		.input(UpsertManyOrgPhoneSchema)
		.mutation(async ({ ctx, input }) => {
			const { orgSlug, data } = input

			const existing = await ctx.prisma.orgPhone.findMany({
				where: {
					id: { in: compact(data.map(({ id }) => id)) },
				},
				include: { services: true, locations: true },
			})
			const upserts = await ctx.prisma.$transaction(
				data.map(
					({
						phoneType,
						country,
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
						const id = passedId ?? ctx.generateId('orgPhone')

						const services = servicesArr.map((serviceId) => ({ serviceId }))
						const locations = locationsArr.map((orgLocationId) => ({ orgLocationId }))

						return ctx.prisma.orgPhone.upsert({
							where: { id },
							create: {
								id,
								...record,
								country: connectOneIdRequired(country.id),
								phoneType: connectOneId(phoneType),
								services: createManyOptional(services),
								locations: createManyOptional(locations),
								auditLogs,
								description: description
									? generateNestedFreeText({ orgSlug, text: description, type: 'phoneDesc', itemId: id })
									: undefined,
							},
							update: {
								id,
								...record,
								country: connectOneIdRequired(country.id),
								phoneType: connectOrDisconnectId(phoneType),
								services: diffConnectionsMtoN(services, servicesBefore, 'serviceId'),
								locations: diffConnectionsMtoN(locations, locationsBefore, 'orgLocationId'),
								description: description
									? {
											upsert: {
												...generateNestedFreeText({
													orgSlug,
													text: description,
													type: 'phoneDesc',
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
	forContactInfo: publicProcedure
		.input(
			z.object({
				parentId: z.string().regex(getIdPrefixRegex('organization', 'orgLocation', 'orgService')),
				locationOnly: z.boolean().optional(),
			})
		)
		.query(async ({ ctx, input }) => {
			const whereId = (): Prisma.OrgPhoneWhereInput => {
				switch (true) {
					case isIdFor('organization', input.parentId): {
						return { organization: { organization: { id: input.parentId, ...isPublic } } }
					}
					case isIdFor('orgLocation', input.parentId): {
						return { locations: { some: { location: { id: input.parentId, ...isPublic } } } }
					}
					case isIdFor('orgService', input.parentId): {
						return { services: { some: { service: { id: input.parentId, ...isPublic } } } }
					}
					default: {
						return {}
					}
				}
			}

			const result = await ctx.prisma.orgPhone.findMany({
				where: {
					...isPublic,
					...whereId(),
					...(input.locationOnly !== undefined ? { locationOnly: input.locationOnly } : {}),
				},
				select: {
					id: true,
					number: true,
					ext: true,
					country: { select: { cca2: true } },
					primary: true,
					description: { select: { tsKey: { select: { text: true, key: true } } } },
					phoneType: { select: { key: { select: { text: true, key: true } } } },
					locationOnly: true,
				},
				orderBy: { primary: 'desc' },
			})
			const transformed = result.map(({ description, phoneType, country, ...record }) => ({
				...record,
				country: country?.cca2,
				phoneType: phoneType ? { key: phoneType?.key.key, defaultText: phoneType?.key.text } : null,
				description: description
					? { key: description?.tsKey.key, defaultText: description?.tsKey.text }
					: null,
			}))
			return transformed
		}),
})
