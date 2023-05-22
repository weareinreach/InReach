import { TRPCError } from '@trpc/server'
import flush from 'just-flush'
import mapObjectVals from 'just-map-values'
import { z } from 'zod'

import { type Prisma } from '@weareinreach/db/client'
import { handleError } from '~api/lib/errorHandler'
import { transformer } from '~api/lib/transformer'
import {
	defineRouter,
	permissionedProcedure,
	protectedProcedure,
	publicProcedure,
	staffProcedure,
} from '~api/lib/trpc'
import {
	forServiceDrawer,
	serviceById,
	serviceByLocationId,
	serviceByOrgId,
	serviceByUserListId,
} from '~api/schemas/selects/orgService'

export const queries = defineRouter({
	byId: publicProcedure.input(serviceById).query(async ({ ctx, input }) => {
		try {
			const result = await ctx.prisma.orgService.findUniqueOrThrow(input)

			return result
		} catch (error) {
			handleError(error)
		}
	}),
	byOrgId: permissionedProcedure('updateOrgService')
		.input(serviceByOrgId)
		.query(async ({ ctx, input }) => {
			try {
				const results = await ctx.prisma.orgService.findMany(input)
				return results
			} catch (error) {
				handleError(error)
			}
		}),
	byOrgLocationId: publicProcedure.input(serviceByLocationId).query(async ({ ctx, input }) => {
		try {
			const results = await ctx.prisma.orgService.findMany(input)
			return results
		} catch (error) {
			handleError(error)
		}
	}),
	byUserListId: protectedProcedure.input(serviceByUserListId).query(async ({ ctx, input }) => {
		try {
			const { select, where } = input
			const revisedInput = {
				where: {
					userLists: {
						some: {
							list: {
								AND: {
									id: where.userLists.some.listId,
									ownedById: ctx.session.user.id,
								},
							},
						},
					},
				},
				select,
			} satisfies Prisma.OrgServiceFindManyArgs

			const results = await ctx.prisma.orgService.findMany(revisedInput)
			return results
		} catch (error) {
			handleError(error)
		}
	}),
	getFilterOptions: publicProcedure.query(async ({ ctx }) => {
		const result = await ctx.prisma.serviceCategory.findMany({
			where: {
				active: true,
			},
			select: {
				id: true,
				tsKey: true,
				tsNs: true,
				services: {
					where: {
						active: true,
					},
					select: {
						id: true,
						tsKey: true,
						tsNs: true,
					},
					orderBy: {
						tsKey: 'asc',
					},
				},
			},
			orderBy: {
				tsKey: 'asc',
			},
		})
		return result
	}),
	getParentName: publicProcedure
		.input(z.object({ slug: z.string(), orgLocationId: z.string() }).partial())
		.query(async ({ ctx, input }) => {
			const { slug, orgLocationId } = input

			switch (true) {
				case Boolean(slug): {
					return ctx.prisma.organization.findUniqueOrThrow({
						where: { slug },
						select: { name: true },
					})
				}
				case Boolean(orgLocationId): {
					return ctx.prisma.orgLocation.findUniqueOrThrow({
						where: { id: orgLocationId },
						select: { name: true },
					})
				}
				default: {
					throw new TRPCError({ code: 'BAD_REQUEST' })
				}
			}
		}),
	getNames: permissionedProcedure('getDetails')
		.input(z.object({ organizationId: z.string(), orgLocationId: z.string() }).partial())
		.query(async ({ ctx, input }) => {
			const { orgLocationId, organizationId } = input

			if (!orgLocationId && !organizationId) throw new TRPCError({ code: 'BAD_REQUEST' })

			const results = await ctx.prisma.orgService.findMany({
				where: {
					organizationId: organizationId,
					...(orgLocationId
						? {
								locations: {
									some: { orgLocationId },
								},
						  }
						: {}),
				},
				select: {
					id: true,
					serviceName: { select: { key: true, tsKey: { select: { text: true } } } },
				},
			})
			const transformedResults = flush(
				results.map(({ id, serviceName }) => {
					if (!serviceName) return
					return { id, tsKey: serviceName.key, defaultText: serviceName.tsKey.text }
				})
			)
			return transformedResults
		}),
	forServiceDrawer: permissionedProcedure('updateOrgService')
		.input(forServiceDrawer)
		.query(async ({ ctx, input }) => {
			try {
				type ServObj = { [k: string]: Set<string> }
				type ServItem = {
					id: string
					name: {
						tsNs?: string
						tsKey?: string
						defaultText?: string
					}
					locations: (string | null)[]
					attributes: { id: string; tsKey: string; tsNs: string }[]
				}

				const results = await ctx.prisma.orgService.findMany(input)
				let servObj: ServObj = {}
				for (const service of results) {
					servObj = service.services.reduce((items: ServObj, record) => {
						const key = record.tag.category.tsKey
						if (!items[key]) {
							items[key] = new Set()
						}
						const itemToAdd = {
							id: service.id,
							name: {
								tsNs: service.serviceName?.ns,
								tsKey: service.serviceName?.key,
								defaultText: service.serviceName?.tsKey.text,
							},
							locations: service.locations.map(({ location }) => location.name),
							attributes: service.attributes.map(({ attribute }) => {
								const { id, tsKey, tsNs } = attribute
								return { id, tsKey, tsNs }
							}),
						} satisfies ServItem

						items[key]?.add(transformer.stringify(itemToAdd))
						return items
					}, servObj)
				}
				const transformed = mapObjectVals(servObj, (value) =>
					[...value].map((item) => transformer.parse<ServItem>(item))
				)
				return transformed
			} catch (error) {
				handleError(error)
			}
		}),
})
