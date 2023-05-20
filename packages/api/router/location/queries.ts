import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { handleError } from '~api/lib/errorHandler'
import { defineRouter, permissionedProcedure, publicProcedure } from '~api/lib/trpc'
import { id, orgId } from '~api/schemas/common'
import { isPublic } from '~api/schemas/selects/common'
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
					accessible: supplementId
						? {
								supplementId,
								boolean,
						  }
						: undefined,
					services: services.map(({ serviceId }) => serviceId),
				},
			}

			return transformedResult
		}),
})
