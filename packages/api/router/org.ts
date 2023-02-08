import { Prisma } from '@weareinreach/db'

import { handleError } from '~api/lib'
import { defineRouter, publicProcedure, staffProcedure } from '~api/lib/trpc'
import { id, searchTerm, slug } from '~api/schemas/common'
import { GenerateAuditLog } from '~api/schemas/create/auditLog'
import { CreateQuickOrgSchema } from '~api/schemas/create/organization'
import { organizationInclude } from '~api/schemas/selects/org'

export const orgRouter = defineRouter({
	getById: publicProcedure.input(id).query(async ({ ctx, input }) => {
		try {
			const { include } = organizationInclude
			const org = await ctx.prisma.organization.findUniqueOrThrow({
				where: {
					id: input.id,
				},
				include,
			})
			return org
		} catch (error) {
			handleError(error)
		}
	}),
	getBySlug: publicProcedure.input(slug).query(async ({ ctx, input }) => {
		try {
			const { slug } = input
			const { include } = organizationInclude
			const org = await ctx.prisma.organization.findUniqueOrThrow({
				where: {
					slug,
				},
				include,
			})
			return org
		} catch (error) {
			handleError(error)
		}
	}),
	getIdFromSlug: publicProcedure.input(slug).query(async ({ ctx, input }) => {
		try {
			const { slug } = input
			const orgId = await ctx.prisma.organization.findUniqueOrThrow({
				where: { slug },
				select: { id: true },
			})
			return orgId
		} catch (error) {
			handleError(error)
		}
	}),
	searchName: publicProcedure.input(searchTerm).query(async ({ ctx, input }) => {
		try {
			const orgIds = await ctx.prisma.organization.findMany({
				where: {
					name: {
						contains: input.search,
						mode: 'insensitive',
					},
				},
				select: {
					id: true,
					name: true,
				},
			})
			return orgIds
		} catch (error) {
			handleError(error)
		}
	}),
	createNewQuick: staffProcedure.input(CreateQuickOrgSchema).mutation(async ({ ctx, input }) => {
		try {
			const result = await ctx.prisma.$transaction(async (tx) => {
				const newOrg = await tx.organization.create(input)

				const { description, emails, locations, phones, socialMedia, websites, ...org } = newOrg
				const auditSources = { description, emails, locations, phones, socialMedia, websites, org } as const
				type Entries<T> = { [K in keyof T]: [key: K, value: T[K]] }[keyof T][]
				const auditEntries: Prisma.AuditLogUncheckedCreateInput[] = []
				const auditBase = { actorId: ctx.session.user.id, from: {}, operation: 'CREATE' } as const

				for (const [key, value] of Object.entries(auditSources) as Entries<typeof auditSources>) {
					if (value === null || (Array.isArray(value) && !value.length)) continue
					switch (key) {
						case 'description': {
							const { id, ...data } = value
							auditEntries.push(GenerateAuditLog({ ...auditBase, to: data, freeTextId: id }))
							break
						}
						case 'emails': {
							const entries = value.map(({ id, ...data }) =>
								GenerateAuditLog({ ...auditBase, to: data, orgEmailId: id })
							)
							auditEntries.push(...entries)
							break
						}
						case 'locations': {
							const entries = value.map(({ id, ...data }) =>
								GenerateAuditLog({ ...auditBase, to: data, orgLocationId: id })
							)
							auditEntries.push(...entries)
							break
						}
						case 'phones': {
							const entries = value.map(({ id, ...data }) =>
								GenerateAuditLog({ ...auditBase, to: data, orgPhoneId: id })
							)
							auditEntries.push(...entries)
							break
						}
						case 'socialMedia': {
							const entries = value.map(({ id, ...data }) =>
								GenerateAuditLog({ ...auditBase, to: data, orgSocialMediaId: id })
							)
							auditEntries.push(...entries)
							break
						}
						case 'websites': {
							const entries = value.map(({ id, ...data }) =>
								GenerateAuditLog({ ...auditBase, to: data, orgWebsiteId: id })
							)
							auditEntries.push(...entries)
							break
						}
						case 'org': {
							const { id, ...data } = value
							auditEntries.push(GenerateAuditLog({ ...auditBase, to: data, organizationId: id }))
							break
						}
					}
				}
				await tx.auditLog.createMany({
					data: auditEntries,
				})

				return newOrg
			})
			return result
		} catch (error) {
			handleError(error)
		}
	}),
})
