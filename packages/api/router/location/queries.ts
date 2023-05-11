import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { defineRouter, handleError, permissionedProcedure, publicProcedure } from '~api/lib'
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
})
