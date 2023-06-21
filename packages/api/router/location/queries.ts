import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { handleError } from '~api/lib/errorHandler'
import { defineRouter, permissionedProcedure, publicProcedure } from '~api/lib/trpc'
import { id, orgId } from '~api/schemas/common'
import { attributes, freeText, isPublic } from '~api/schemas/selects/common'
import { orgLocationInclude } from '~api/schemas/selects/org'

export const queries = defineRouter({
	getById: publicProcedure.input(id).query(async ({ ctx, input }) => {
		try {
			const location = await ctx.prisma.orgLocation.findUniqueOrThrow({
				where: {
					id: input.id,
					...isPublic,
				},
				select: orgLocationInclude(ctx).select,
			})
			return location
		} catch (error) {
			handleError(error)
		}
	}),
	getByOrgId: publicProcedure.input(orgId).query(async ({ ctx, input }) => {
		try {
			const locations = await ctx.prisma.orgLocation.findMany({
				where: {
					orgId: input.orgId,
					...isPublic,
				},
				select: orgLocationInclude(ctx).select,
			})
			if (locations.length === 0) throw new TRPCError({ code: 'NOT_FOUND' })
			return locations
		} catch (error) {
			handleError(error)
		}
	}),
	getNameById: publicProcedure.input(z.string()).query(async ({ ctx, input }) =>
		ctx.prisma.orgLocation.findUniqueOrThrow({
			where: { id: input },
			select: { name: true },
		})
	),
	getNames: permissionedProcedure('getDetails')
		.input(z.object({ organizationId: z.string() }))
		.query(async ({ ctx, input }) => {
			const { organizationId } = input

			if (!organizationId) throw new TRPCError({ code: 'BAD_REQUEST' })

			const results = await ctx.prisma.orgLocation.findMany({
				where: {
					organization: { id: organizationId },
				},
				select: {
					id: true,
					name: true,
				},
			})

			return results
		}),
	getAddress: permissionedProcedure('updateLocation')
		.input(z.string())
		.query(async ({ ctx, input }) => {
			const result = await ctx.prisma.orgLocation.findUniqueOrThrow({
				where: { id: input },
				select: {
					id: true,
					name: true,
					street1: true,
					street2: true,
					city: true,
					postCode: true,
					govDistId: true,
					countryId: true,
					attributes: {
						select: {
							attribute: { select: { id: true, tsKey: true, tsNs: true } },
							supplement: { select: { id: true, boolean: true } },
						},
						where: { attribute: { tag: 'wheelchair-accessible' } },
					},
					latitude: true,
					longitude: true,
					mailOnly: true,
					published: true,
					services: { select: { serviceId: true } },
				},
			})
			const { id, attributes, services, ...rest } = result

			const accessibleAttribute = attributes.find(({ supplement }) => Boolean(supplement.length))
			const { id: supplementId, boolean } = accessibleAttribute
				? accessibleAttribute.supplement.find(({ id }) => Boolean(id)) ?? {}
				: { id: undefined, boolean: undefined }

			const transformedResult = {
				id,
				data: {
					...rest,
					accessible: {
						supplementId,
						boolean,
					},
					services: services.map(({ serviceId }) => serviceId),
				},
			}

			return transformedResult
		}),
	forLocationCard: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
		const result = await ctx.prisma.orgLocation.findUniqueOrThrow({
			where: {
				id: input,
				...isPublic,
			},
			select: {
				id: true,
				name: true,
				street1: true,
				street2: true,
				city: true,
				postCode: true,
				country: { select: { cca2: true } },
				govDist: { select: { abbrev: true, tsKey: true, tsNs: true } },
				phones: {
					where: { phone: isPublic },
					select: { phone: { select: { primary: true, number: true, country: { select: { cca2: true } } } } },
				},
				attributes: { select: { attribute: { select: { tsNs: true, tsKey: true, icon: true } } } },
				services: {
					select: {
						service: {
							select: {
								services: { select: { tag: { select: { category: { select: { tsKey: true } } } } } },
							},
						},
					},
				},
			},
		})

		const transformed = {
			...result,
			country: result.country.cca2,
			phones: result.phones.map(({ phone }) => ({ ...phone, country: phone.country.cca2 })),
			attributes: result.attributes.map(({ attribute }) => attribute),
			services: [
				...new Set(
					result.services.flatMap(({ service }) => service.services.map(({ tag }) => tag.category.tsKey))
				),
			],
		}

		return transformed
	}),
	forVisitCard: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
		const result = await ctx.prisma.orgLocation.findUniqueOrThrow({
			where: {
				...isPublic,
				id: input,
			},
			select: {
				id: true,
				street1: true,
				street2: true,
				city: true,
				postCode: true,
				country: { select: { cca2: true } },
				govDist: { select: { abbrev: true, tsKey: true, tsNs: true } },
				attributes: {
					where: { attribute: { tsKey: 'additional.offers-remote-services' } },
					select: { attribute: { select: { tsKey: true, icon: true } } },
				},
			},
		})
		const { attributes, ...rest } = result
		const transformed = {
			...rest,
			remote: attributes.find(({ attribute }) => attribute.tsKey === 'additional.offers-remote-services')
				?.attribute,
		}
		return transformed
	}),
	forGoogleMaps: publicProcedure.input(z.string().or(z.string().array())).query(async ({ ctx, input }) => {
		const select = {
			id: true,
			name: true,
			latitude: true,
			longitude: true,
		}

		const result = Array.isArray(input)
			? await ctx.prisma.orgLocation.findMany({
					where: {
						...isPublic,
						id: { in: input },
					},
					select,
			  })
			: await ctx.prisma.orgLocation.findUniqueOrThrow({
					where: {
						...isPublic,
						id: input,
					},
					select,
			  })
		return result
	}),
	forLocationPage: publicProcedure.input(id).query(async ({ ctx, input }) => {
		try {
			const location = await ctx.prisma.orgLocation.findUniqueOrThrow({
				where: {
					id: input.id,
					...isPublic,
				},
				select: {
					id: true,
					primary: true,
					name: true,
					street1: true,
					street2: true,
					city: true,
					postCode: true,
					country: { select: { cca2: true } },
					govDist: { select: { abbrev: true, tsKey: true, tsNs: true } },
					longitude: true,
					latitude: true,
					description: freeText,
					attributes,
					reviews: {
						where: { visible: true, deleted: false },
						select: { id: true },
					},
				},
			})
			return location
		} catch (error) {
			handleError(error)
		}
	}),
})
