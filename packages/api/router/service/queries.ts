import { TRPCError } from '@trpc/server'
import flush from 'just-flush'
import mapObjectVals from 'just-map-values'
import { z } from 'zod'

import { getIdPrefixRegex, isIdFor } from '@weareinreach/db'
import { type Prisma } from '@weareinreach/db/client'
import { handleError } from '~api/lib/errorHandler'
import { transformer } from '~api/lib/transformer'
import {
	defineRouter,
	permissionedProcedure,
	protectedProcedure,
	publicProcedure,
	// staffProcedure,
} from '~api/lib/trpc'
import { attributes, freeTextCrowdinId, isPublic } from '~api/schemas/selects/common'
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
						name: 'asc',
					},
				},
			},
			orderBy: {
				category: 'asc',
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
	forServiceEditDrawer: permissionedProcedure('updateOrgService')
		.input(z.string())
		.query(async ({ ctx, input }) => {
			try {
				const result = await ctx.prisma.orgService.findUniqueOrThrow({
					where: { id: input },
					select: {
						id: true,
						accessDetails: {
							select: {
								attribute: { select: { id: true, tsKey: true, tsNs: true } },
								supplement: { select: { id: true, text: freeTextCrowdinId, data: true } },
							},
						},
						attributes: {
							select: {
								attribute: {
									select: {
										id: true,
										tsKey: true,
										tsNs: true,
										icon: true,
										categories: { select: { category: { select: { tag: true } } } },
									},
								},
								supplement: {
									select: {
										id: true,
										active: true,
										data: true,
										boolean: true,
										countryId: true,
										govDistId: true,
										languageId: true,
										text: freeTextCrowdinId,
									},
								},
							},
						},
						description: freeTextCrowdinId,
						phones: { select: { phone: { select: { id: true } } } },
						emails: { select: { email: { select: { id: true } } } },
						locations: { select: { location: { select: { id: true } } } },
						hours: { select: { id: true, dayIndex: true, start: true, end: true, closed: true, tz: true } },
						services: { select: { tag: { select: { id: true, categoryId: true } } } },
						serviceAreas: {
							select: {
								id: true,
								countries: { select: { country: { select: { id: true } } } },
								districts: { select: { govDist: { select: { id: true } } } },
							},
						},
						published: true,
						deleted: true,
						serviceName: freeTextCrowdinId,
					},
				})
				const { attributes, phones, emails, locations, services, serviceAreas, accessDetails, ...rest } =
					result
				const transformed = {
					...rest,
					phones: phones.map(({ phone }) => phone.id),
					emails: emails.map(({ email }) => email.id),
					locations: locations.map(({ location }) => location.id),
					services: services.map(({ tag }) => ({ id: tag.id, categoryId: tag.categoryId })),
					serviceAreas: serviceAreas
						? {
								id: serviceAreas.id,
								countries: serviceAreas.countries.map(({ country }) => country.id),
								districts: serviceAreas.districts.map(({ govDist }) => govDist.id),
						  }
						: null,
					attributes: attributes.map(({ attribute, supplement }) => {
						const { categories, ...attr } = attribute
						return {
							attribute: { ...attr, categories: categories.map(({ category }) => category.tag) },
							supplement: supplement.map(({ data, ...rest }) => {
								if (data) {
									return { ...rest, data: transformer.parse(JSON.stringify(data)) }
								}
								return { ...rest, data }
							}),
						}
					}),
					accessDetails: accessDetails.map(({ attribute, supplement }) => ({
						attribute,
						supplement: supplement.map(({ data, ...rest }) => {
							if (data) {
								return { ...rest, data: transformer.parse(JSON.stringify(data)) }
							}
							return { ...rest, data }
						}),
					})),
				}

				return transformed
			} catch (error) {
				handleError(error)
			}
		}),
	getOptions: permissionedProcedure('updateOrgService').query(async ({ ctx }) => {
		const result = await ctx.prisma.serviceTag.findMany({
			select: {
				id: true,
				active: true,
				tsKey: true,
				tsNs: true,
				category: {
					select: {
						id: true,
						active: true,
						tsKey: true,
						tsNs: true,
					},
				},
			},
		})
		return result
	}),
	forServiceInfoCard: publicProcedure
		.input(
			z.object({
				parentId: z.string().regex(getIdPrefixRegex('organization', 'orgLocation')),
				remoteOnly: z.boolean().optional(),
			})
		)
		.query(async ({ ctx, input }) => {
			const result = await ctx.prisma.orgService.findMany({
				where: {
					...isPublic,
					...(isIdFor('organization', input.parentId)
						? { organization: { id: input.parentId, ...isPublic } }
						: { locations: { some: { location: { id: input.parentId, ...isPublic } } } }),
					...(input.remoteOnly
						? { attributes: { some: { attribute: { active: true, tag: 'offers-remote-services' } } } }
						: {}),
				},
				select: {
					id: true,
					serviceName: { select: { key: true, ns: true, tsKey: { select: { text: true } } } },
					services: {
						select: {
							tag: {
								select: { tsKey: true, category: { select: { tsKey: true } } },
							},
						},
						where: { tag: { active: true, category: { active: true } } },
					},
					attributes: {
						where: { attribute: { active: true, tag: 'offers-remote-services' } },
						select: { attributeId: true },
					},
				},
			})

			const transformed = result.map(({ id, serviceName, services, attributes }) => ({
				id,
				serviceName: serviceName
					? { tsKey: serviceName.tsKey, tsNs: serviceName.ns, defaultText: serviceName.tsKey.text }
					: null,
				serviceCategories: [...new Set(services.map(({ tag }) => tag.category.tsKey))].sort(),
				offersRemote: attributes.length > 0,
			}))
			return transformed
		}),
	forServiceModal: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
		const result = await ctx.prisma.orgService.findUniqueOrThrow({
			where: { id: input, ...isPublic },
			select: {
				id: true,
				services: { select: { tag: { select: { tsKey: true } } }, where: { tag: { active: true } } },
				accessDetails: {
					where: { active: true },

					select: {
						attribute: { select: { id: true } },
						supplement: {
							where: { active: true },
							select: {
								id: true,
								data: true,
								text: { select: { key: true, tsKey: { select: { text: true } } } },
							},
						},
					},
				},
				serviceName: {
					select: {
						key: true,
						ns: true,
						tsKey: {
							select: {
								text: true,
							},
						},
					},
				},
				locations: {
					where: { location: isPublic },
					select: { location: { select: { country: { select: { cca2: true } } } } },
				},
				attributes,
				hours: { where: { active: true }, select: { _count: true } },
				description: {
					select: {
						key: true,
						ns: true,
						tsKey: {
							select: {
								text: true,
							},
						},
					},
				},
			},
		})
		return result
	}),
})
