import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { handleError } from '~api/lib'
import { nanoUrl } from '~api/lib/nanoIdUrl'
import { defineRouter, protectedProcedure, publicProcedure } from '~api/lib/trpc'
import { id } from '~api/schemas/common'
import { CreateSavedList, CreateListAndEntry } from '~api/schemas/create/userSavedList'
import { schemas } from '~api/schemas/savedLists'
import { SaveItem, DeleteSavedItem } from '~api/schemas/update/userSavedList'

import { CreateAuditLog } from '../schemas/create/auditLog'

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
	create: protectedProcedure.input(CreateSavedList().inputSchema).mutation(async ({ ctx, input }) => {
		try {
			const { dataParser } = CreateSavedList()

			const inputData = {
				actorId: ctx.session.user.id,
				ownedById: ctx.session.user.id,
				data: input,
				operation: 'CREATE',
			} satisfies z.input<typeof dataParser>

			const data = dataParser.parse(inputData)

			const list = await ctx.prisma.userSavedList.create(data)
			return list
		} catch (error) {
			handleError(error)
		}
	}),
	/** Create a new list and save an organization or service to it */
	createAndSaveItem: protectedProcedure
		.input(CreateListAndEntry().inputSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				const { dataParser } = CreateListAndEntry()

				const inputData = {
					actorId: ctx.session.user.id,
					operation: 'CREATE',
					ownedById: ctx.session.user.id,
					data: input,
				} satisfies z.input<typeof dataParser>

				const data = dataParser.parse(inputData)
				const result = await ctx.prisma.userSavedList.create(data)

				const flattenedResult = {
					...result,
					organizations: result.organizations.map((x) => x.organizationId),
					services: result.services.map((x) => x.serviceId),
				}
				return flattenedResult
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

	saveItem: protectedProcedure.input(SaveItem().inputSchema).mutation(async ({ ctx, input }) => {
		try {
			const { dataParser } = SaveItem()

			const inputData = {
				actorId: ctx.session.user.id,
				ownedById: ctx.session.user.id,
				operation: 'LINK',
				data: input,
			} satisfies z.input<typeof dataParser>
			const data = dataParser.parse(inputData)

			const result = await ctx.prisma.userSavedList.update(data)
			const flattenedResult = {
				...result,
				organizations: result.organizations.map((x) => x.organizationId),
				services: result.services.map((x) => x.serviceId),
			}
			return flattenedResult
		} catch (error) {
			handleError(error)
		}
	}),
	deleteItem: protectedProcedure.input(DeleteSavedItem().inputSchema).mutation(async ({ ctx, input }) => {
		const { dataParser } = DeleteSavedItem()

		const inputData = {
			actorId: ctx.session.user.id,
			ownedById: ctx.session.user.id,
			operation: 'UNLINK',
			data: input,
		} satisfies z.input<typeof dataParser>
		const data = dataParser.parse(inputData)

		const result = await ctx.prisma.userSavedList.update(data)
		const flattenedResult = {
			...result,
			organizations: result.organizations.map((x) => x.organizationId),
			services: result.services.map((x) => x.serviceId),
		}
		return flattenedResult
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
			const from = { sharedLinkKey: null }

			const data = { sharedLinkKey: urlSlug }
			const result = await ctx.prisma.userSavedList.update({
				where: input,
				data: {
					...data,
					auditLogs: CreateAuditLog({ actorId: ctx.session.user.id, operation: 'UPDATE', from, to: data }),
				},
				select: {
					id: true,
					name: true,
					sharedLinkKey: true,
				},
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
				const from = await tx.userSavedList.findUniqueOrThrow({
					where: input,
					select: { sharedLinkKey: true },
				})

				if (from.sharedLinkKey === null)
					throw new TRPCError({ code: 'BAD_REQUEST', message: `No shared URL for listId ${input.id}` })

				const data = { sharedLinkKey: null }
				const sharedUrl = await tx.userSavedList.update({
					where: input,
					data: {
						...data,
						auditLogs: CreateAuditLog({ actorId: ctx.session.user.id, operation: 'UPDATE', from, to: data }),
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
