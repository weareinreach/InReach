import { nanoUrl } from '../lib/nanoIdUrl'
import { defineRouter, protectedProcedure } from '../lib/trpc'
import { listId, listIdOrgId, listIdServiceId } from '../schemas/savedLists'

export const savedListRouter = defineRouter({
	getAllLists: protectedProcedure.query(async ({ ctx }) => {
		const lists = await ctx.prisma.userSavedList.findMany({
			where: {
				ownedById: ctx.session.user.id,
			},
			include: {
				_count: {
					select: {
						organizations: true,
						services: true,
						sharedWith: true,
					},
				},
			},
		})
		return lists
	}),
	getList: protectedProcedure.input(listId).query(async ({ ctx, input }) => {
		const list = await ctx.prisma.userSavedList.findFirst({
			where: {
				id: input.id,
			},
			include: {
				organizations: true,
				services: true,
				sharedWith: true,
			},
		})
		return list
	}),
	saveOrg: protectedProcedure.input(listIdOrgId).mutation(async ({ ctx, input }) => {
		const result = await ctx.prisma.savedOrganization.create({
			data: input,
		})
		return result
	}),
	delOrg: protectedProcedure.input(listIdOrgId).mutation(async ({ ctx, input }) => {
		const result = await ctx.prisma.savedOrganization.delete({
			where: { listId_organizationId: input },
		})
		return result
	}),
	saveService: protectedProcedure.input(listIdServiceId).mutation(async ({ ctx, input }) => {
		const result = await ctx.prisma.savedService.create({
			data: input,
		})
		return result
	}),
	delService: protectedProcedure.input(listIdServiceId).mutation(async ({ ctx, input }) => {
		const result = await ctx.prisma.savedService.delete({
			where: { listId_serviceId: input },
		})
		return result
	}),
	shareUrl: protectedProcedure.input(listId).mutation(async ({ ctx, input }) => {
		const urlSlug = nanoUrl()
		const sharedUrl = await ctx.prisma.userSavedList.update({
			where: input,
			data: {
				sharedLinkKey: urlSlug,
			},
			select: {
				id: true,
				name: true,
				sharedLinkKey: true,
			},
		})
		return sharedUrl
	}),
	unShareUrl: protectedProcedure.input(listId).mutation(async ({ ctx, input }) => {
		const sharedUrl = await ctx.prisma.userSavedList.update({
			where: input,
			data: {
				sharedLinkKey: null,
			},
			select: {
				id: true,
				name: true,
				sharedLinkKey: true,
			},
		})
		return sharedUrl
	}),
})
