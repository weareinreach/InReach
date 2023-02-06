import { TRPCError } from '@trpc/server'

import { createAuditLog, handleError } from '../lib'
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
			const auditLogs = createAuditLog<typeof input, 'userSavedList'>({
				table: 'userSavedList',
				actorId: ctx.session.user.id,
				operation: 'create',
				to: data,
			})

			const list = await ctx.prisma.userSavedList.create({
				data: {
					...data,
					auditLogs,
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
				const actorId = ctx.session.user.id
				const newList = {
					name: input.listName,
					ownedById: actorId,
				}
				const { id: listId } = await tx.userSavedList.create({
					data: {
						...newList,
						auditLogs: createAuditLog<typeof newList, 'userSavedList'>({
							actorId,
							operation: 'create',
							table: 'userSavedList',
							to: newList,
						}),
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
					data: createAuditLog<typeof saveOrg, 'savedOrganization'>({
						actorId,
						operation: 'link',
						table: 'savedOrganization',
						recordId: saveOrg,
						to: saveOrg,
					}).create,
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
				const actorId = ctx.session.user.id
				const result = await ctx.prisma.$transaction(async (tx) => {
					const newList = {
						name: input.listName,
						ownedById: actorId,
					}

					const { id: listId } = await tx.userSavedList.create({
						data: {
							...newList,
							auditLogs: createAuditLog<typeof newList, 'userSavedList'>({
								actorId,
								operation: 'create',
								table: 'userSavedList',
								to: newList,
							}),
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
						data: createAuditLog<typeof saveService, 'savedService'>({
							actorId,
							operation: 'link',
							table: 'savedService',
							recordId: saveService,
							to: saveService,
						}).create,
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
				const addOrg = await tx.savedOrganization.create({
					data: input,
				})
				if (addOrg) {
					await tx.auditLog.create({
						data: createAuditLog<typeof input, 'savedOrganization'>({
							actorId: ctx.session.user.id,
							operation: 'link',
							table: 'savedOrganization',
							to: input,
							recordId: input,
						}).create,
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
				const delOrg = await tx.savedOrganization.delete({
					where: { listId_organizationId: input },
				})
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
				const addService = await tx.savedService.create({
					data: input,
				})
				if (addService) {
					await tx.auditLog.create({
						data: createAuditLog<typeof input, 'savedService'>({
							actorId: ctx.session.user.id,
							operation: 'link',
							table: 'savedService',
							to: input,
							recordId: input,
						}).create,
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
				const delOrg = await tx.savedService.delete({
					where: { listId_serviceId: input },
				})
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
				const data = { sharedLinkKey: urlSlug }

				const sharedUrl = await tx.userSavedList.update({
					where: input,
					data: {
						...data,
						auditLogs: createAuditLog<typeof data, 'userSavedList'>({
							actorId: ctx.session.user.id,
							from: { sharedLinkKey: null },
							to: data,
							operation: 'update',
							table: 'userSavedList',
						}),
					},
					select: {
						id: true,
						name: true,
						sharedLinkKey: true,
					},
				})
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
				})) ?? { sharedLinkKey: null }

				const data = { sharedLinkKey: null }
				const sharedUrl = await tx.userSavedList.update({
					where: input,
					data: {
						...data,
						auditLogs: createAuditLog<typeof data, 'userSavedList'>({
							actorId: ctx.session.user.id,
							from,
							to: data,
							operation: 'update',
							table: 'userSavedList',
						}),
					},
					select: {
						id: true,
						name: true,
						sharedLinkKey: true,
					},
				})
				return sharedUrl
			})
			return result
		} catch (error) {
			handleError(error)
		}
	}),
})
