import { TRPCError } from '@trpc/server'
import remove from 'just-remove'

import { nanoUrl } from '../lib/nanoIdUrl'
import { defineRouter, protectedProcedure, publicProcedure } from '../lib/trpc'
import { id } from '../schemas/common'
import { createList, listId, listIdOrgId, listIdServiceId, urlSlug } from '../schemas/savedLists'

export const savedListRouter = defineRouter({
	/** Get all saved lists for logged in user */
	getAll: protectedProcedure.query(async ({ ctx }) => {
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
	/** Get list by ID. List must be owned by or shared with logged in user */
	getById: protectedProcedure.input(listId).query(async ({ ctx, input }) => {
		const list = await ctx.prisma.userSavedList.findFirst({
			where: {
				id: input.id,
				OR: [
					{
						ownedById: ctx.session.user.id,
					},
					{
						sharedWith: {
							some: {
								userId: ctx.session.user.id,
							},
						},
					},
				],
			},
			include: {
				organizations: true,
				services: true,
				sharedWith: true,
			},
		})
		return list
	}),
	/** Get list by shared URL slug */
	getByUrl: publicProcedure.input(urlSlug).query(async ({ ctx, input }) => {
		const list = await ctx.prisma.userSavedList.findUnique({
			where: {
				sharedLinkKey: input.slug,
			},
			include: {
				organizations: true,
				services: true,
			},
		})
		if (!list) {
			throw new TRPCError({ code: 'NOT_FOUND' })
		}
		return list
	}),
	/** Create list for logged in user */
	create: protectedProcedure.input(createList).mutation(async ({ ctx, input }) => {
		const data = {
			...input,
			ownedById: ctx.session.user.id,
		}

		const list = await ctx.prisma.userSavedList.create({
			data: {
				...data,
				auditLogs: {
					create: {
						from: {},
						to: data,
						actorId: ctx.session.user.id,
					},
				},
			},
		})
		return list
	}),
	/** Delete list by id for current logged in user */
	delete: protectedProcedure.input(id).mutation(async ({ ctx, input }) => {
		const result = await ctx.prisma.userSavedList.delete({
			where: {
				id: input.id,
				ownedById: ctx.session.user.id,
			},
		})
		return result
	}),
	/** Save organization to list */
	saveOrg: protectedProcedure.input(listIdOrgId).mutation(async ({ ctx, input }) => {
		const result = await ctx.prisma.$transaction(async (tx) => {
			const from = (await tx.userSavedList.findUnique({
				where: {
					id: input.listId,
				},
				select: { organizations: { select: { organizationId: true } } },
			})) ?? { organizations: [] }
			const to = from
			to?.organizations.push({ organizationId: input.organizationId })
			const addOrg = await tx.savedOrganization.create({
				data: input,
			})
			if (addOrg) {
				await tx.auditLog.create({
					data: {
						actorId: ctx.session.user.id,
						from,
						to,
						userSavedListId: input.listId,
					},
				})
			}
			return addOrg
		})
		return result
	}),
	/** Remove organization from list */
	delOrg: protectedProcedure.input(listIdOrgId).mutation(async ({ ctx, input }) => {
		const result = await ctx.prisma.$transaction(async (tx) => {
			const from = (await tx.userSavedList.findUnique({
				where: {
					id: input.listId,
				},
				select: { organizations: { select: { organizationId: true } } },
			})) ?? { organizations: [] }
			const to = {
				organizations: remove(from.organizations, [{ organizationId: input.organizationId }]),
			}
			const delOrg = await tx.savedOrganization.delete({
				where: { listId_organizationId: input },
			})
			if (delOrg) {
				await tx.auditLog.create({
					data: {
						actorId: ctx.session.user.id,
						from,
						to,
						userSavedListId: input.listId,
					},
				})
			}
			return delOrg
		})
		return result
	}),
	/** Save service to list */
	saveService: protectedProcedure.input(listIdServiceId).mutation(async ({ ctx, input }) => {
		const result = await ctx.prisma.$transaction(async (tx) => {
			const from = (await tx.userSavedList.findUnique({
				where: {
					id: input.listId,
				},
				select: { services: { select: { serviceId: true } } },
			})) ?? { services: [] }
			const to = from
			to?.services.push({ serviceId: input.serviceId })
			const addService = await tx.savedService.create({
				data: input,
			})
			if (addService) {
				await tx.auditLog.create({
					data: {
						actorId: ctx.session.user.id,
						from,
						to,
						userSavedListId: input.listId,
					},
				})
			}
			return addService
		})
		return result
	}),
	/** Remove service from list */
	delService: protectedProcedure.input(listIdServiceId).mutation(async ({ ctx, input }) => {
		const result = await ctx.prisma.$transaction(async (tx) => {
			const from = (await tx.userSavedList.findUnique({
				where: {
					id: input.listId,
				},
				select: { services: { select: { serviceId: true } } },
			})) ?? { services: [] }
			const to = {
				services: remove(from.services, [{ serviceId: input.serviceId }]),
			}
			const delOrg = await tx.savedService.delete({
				where: { listId_serviceId: input },
			})
			if (delOrg) {
				await tx.auditLog.create({
					data: {
						actorId: ctx.session.user.id,
						from,
						to,
						userSavedListId: input.listId,
					},
				})
			}
			return delOrg
		})
		return result
	}),
	/**
	 * Create url to share list
	 *
	 * List will be viewable by anyone who has this link.
	 */
	shareUrl: protectedProcedure.input(listId).mutation(async ({ ctx, input }) => {
		const generateUniqueSlug = async (): Promise<string> => {
			const slug = nanoUrl()
			const response = await ctx.prisma.userSavedList.findUnique({
				where: {
					sharedLinkKey: slug,
				},
			})
			if (response) {
				return generateUniqueSlug()
			}
			return slug
		}
		const urlSlug = await generateUniqueSlug()

		const result = await ctx.prisma.$transaction(async (tx) => {
			const from = (await tx.userSavedList.findUnique({
				where: input,
				select: { sharedLinkKey: true },
			})) ?? { sharedLinkKey: undefined }

			const sharedUrl = await tx.userSavedList.update({
				where: input,
				data: { sharedLinkKey: urlSlug },
				select: {
					id: true,
					name: true,
					sharedLinkKey: true,
				},
			})
			if (sharedUrl) {
				const { sharedLinkKey, id } = sharedUrl
				await tx.auditLog.create({
					data: {
						actorId: ctx.session.user.id,
						from,
						to: { sharedLinkKey },
						userSavedListId: id,
					},
				})
			}

			return sharedUrl
		})
		return result
	}),
	/**
	 * Delete shared URL
	 *
	 * Anyone who visits the old URL will be presented a 404
	 */
	unShareUrl: protectedProcedure.input(listId).mutation(async ({ ctx, input }) => {
		const result = await ctx.prisma.$transaction(async (tx) => {
			const from = (await tx.userSavedList.findUnique({
				where: input,
				select: { sharedLinkKey: true },
			})) ?? { sharedLinkKey: undefined }

			const sharedUrl = await tx.userSavedList.update({
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
			if (sharedUrl) {
				const { sharedLinkKey, id } = sharedUrl
				await tx.auditLog.create({
					data: {
						actorId: ctx.session.user.id,
						from,
						to: { sharedLinkKey },
						userSavedListId: id,
					},
				})
			}
			return sharedUrl
		})
		return result
	}),
})
