import { TRPCError } from '@trpc/server'
import remove from 'just-remove'

import { handleError } from '../lib'
import { nanoUrl } from '../lib/nanoIdUrl'
import { defineRouter, protectedProcedure, publicProcedure } from '../lib/trpc'
import { id } from '../schemas/common'
import { schemas } from '../schemas/savedLists'

export const savedListRouter = defineRouter({
	/** Get all saved lists for logged in user */
	getAll: protectedProcedure.query(async ({ ctx }) => {
		try {
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
		} catch (error) {
			handleError(error)
		}
	}),
	/** Get list by ID. List must be owned by or shared with logged in user */
	getById: protectedProcedure.input(schemas.listId).query(async ({ ctx, input }) => {
		try {
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
		} catch (error) {
			handleError(error)
		}
	}),
	/** Get list by shared URL slug */
	getByUrl: publicProcedure.input(schemas.urlSlug).query(async ({ ctx, input }) => {
		try {
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
		} catch (error) {
			handleError(error)
		}
	}),
	/** Create list for logged in user */
	create: protectedProcedure.input(schemas.createList).mutation(async ({ ctx, input }) => {
		try {
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
		} catch (error) {
			handleError(error)
		}
	}),
	/** Create a new list and save an organization to it */
	createAndSaveOrg: protectedProcedure.input(schemas.createAndSaveOrg).mutation(async ({ ctx, input }) => {
		try {
			const result = await ctx.prisma.$transaction(async (tx) => {
				const newList = {
					name: input.listName,
					ownedById: ctx.session.user.id,
				}
				const { id: listId } = await tx.userSavedList.create({
					data: {
						...newList,
						auditLogs: {
							create: {
								from: {},
								to: newList,
								actorId: ctx.session.user.id,
							},
						},
					},
					select: { id: true },
				})
				const saveOrg = {
					listId,
					organizationId: input.organizationId,
				}

				const savedOrg = await tx.savedOrganization.create({
					data: saveOrg,
				})
				await tx.auditLog.create({
					data: {
						from: {},
						to: {
							organizations: [input.organizationId],
						},
						userSavedListId: listId,
						actorId: ctx.session.user.id,
					},
				})
				if (!savedOrg)
					throw new Error('Error creating and/or saving to list', { cause: { input, listId, savedOrg, ctx } })
				return savedOrg
			})
			return result
		} catch (error) {
			handleError(error)
		}
	}),
	/** Create a new list and save a service to it */
	createAndSaveService: protectedProcedure
		.input(schemas.createAndSaveService)
		.mutation(async ({ ctx, input }) => {
			try {
				const result = await ctx.prisma.$transaction(async (tx) => {
					const newList = {
						name: input.listName,
						ownedById: ctx.session.user.id,
					}

					const { id: listId } = await tx.userSavedList.create({
						data: {
							...newList,
							auditLogs: {
								create: {
									from: {},
									to: newList,
									actorId: ctx.session.user.id,
								},
							},
						},
						select: { id: true },
					})
					const saveService = {
						listId,
						serviceId: input.serviceId,
					}

					const savedService = await tx.savedService.create({
						data: saveService,
					})
					await tx.auditLog.create({
						data: {
							from: {},
							to: {
								services: [input.serviceId],
							},
							userSavedListId: listId,
							actorId: ctx.session.user.id,
						},
					})
					if (!savedService)
						throw new Error('Error creating and/or saving to list', {
							cause: { input, listId, savedService, ctx },
						})
					return savedService
				})
				return result
			} catch (error) {
				handleError(error)
			}
		}),
	/** Delete list by id for current logged in user */
	delete: protectedProcedure.input(id).mutation(async ({ ctx, input }) => {
		try {
			const list = await ctx.prisma.userSavedList.findFirst({
				where: {
					id: input.id,
					ownedById: ctx.session.user.id,
				},
			})

			if (!list) {
				throw new TRPCError({ code: 'UNAUTHORIZED', message: 'List does not belong to user' })
			}

			const result = await ctx.prisma.userSavedList.delete({
				where: {
					id: input.id,
				},
			})
			return result
		} catch (error) {
			handleError(error)
		}
	}),
	/** Save organization to list */
	saveOrg: protectedProcedure.input(schemas.listIdOrgId).mutation(async ({ ctx, input }) => {
		try {
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
		} catch (error) {
			handleError(error)
		}
	}),
	/** Remove organization from list */
	delOrg: protectedProcedure.input(schemas.listIdOrgId).mutation(async ({ ctx, input }) => {
		try {
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
		} catch (error) {
			handleError(error)
		}
	}),
	/** Save service to list */
	saveService: protectedProcedure.input(schemas.listIdServiceId).mutation(async ({ ctx, input }) => {
		try {
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
		} catch (error) {
			handleError(error)
		}
	}),
	/** Remove service from list */
	delService: protectedProcedure.input(schemas.listIdServiceId).mutation(async ({ ctx, input }) => {
		try {
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
		} catch (error) {
			handleError(error)
		}
	}),
	/**
	 * Create url to share list
	 *
	 * List will be viewable by anyone who has this link.
	 */
	shareUrl: protectedProcedure.input(schemas.listId).mutation(async ({ ctx, input }) => {
		try {
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
		} catch (error) {
			handleError(error)
		}
	}),
	/**
	 * Delete shared URL
	 *
	 * Anyone who visits the old URL will be presented a 404
	 */
	unShareUrl: protectedProcedure.input(schemas.listId).mutation(async ({ ctx, input }) => {
		try {
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
		} catch (error) {
			handleError(error)
		}
	}),
})
