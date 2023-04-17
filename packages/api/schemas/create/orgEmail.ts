import { Prisma, generateId, generateNestedFreeText, slug } from '@weareinreach/db'
import { namespaces } from '@weareinreach/db/seed/data/00-namespaces'
import { z } from 'zod'

export const CreateOrgEmailSchema = z
	.object({
		orgSlug: z.string(),
		data: z.object({
			firstName: z.string().optional(),
			lastName: z.string().optional(),
			primary: z.boolean().optional(),
			email: z.string(),
			published: z.boolean().optional(),
			locationOnly: z.boolean(),
			serviceOnly: z.boolean(),
		}),
		titleId: z.string().optional(),
		title: z.string().optional(),
		description: z.string().optional(),
		/**
		 * Associated only with location/service and not overall organization (for large orgs w/ multiple
		 * locations)
		 */
	})
	.transform(({ orgSlug, data, title, titleId, description }) => {
		const id = generateId('orgEmail')

		return Prisma.validator<Prisma.OrgEmailCreateInput>()({
			...data,
			description: description
				? generateNestedFreeText({ orgSlug, itemId: id, text: description, type: 'emailDesc' })
				: undefined,
			title: title
				? {
						create: {
							title,
							key: {
								create: {
									text: title,
									key: slug(title),
									namespace: { connect: { name: namespaces.userTitle } },
								},
							},
						},
				  }
				: titleId
				? { connect: { id: titleId } }
				: undefined,
		})
	})

export const CreateNestedOrgEmailSchema = z
	.object({
		firstName: z.string().optional(),
		lastName: z.string().optional(),
		primary: z.boolean().default(false),
		email: z.string().email(),
		published: z.boolean().default(false),
	})
	.array()
	.transform((data) => Prisma.validator<Prisma.Enumerable<Prisma.OrgEmailCreateManyInput>>()(data))

export const UpdateOrgEmailSchema = z
	.object({
		id: z.string(),
		data: z
			.object({
				firstName: z.string(),
				lastName: z.string(),
				primary: z.boolean(),
				email: z.string(),
				published: z.boolean(),
				deleted: z.boolean(),
				titleId: z.string(),
				locationOnly: z.boolean(),
				serviceOnly: z.boolean(),
			})
			.partial(),
	})
	.transform(({ data, id }) => Prisma.validator<Prisma.OrgEmailUpdateArgs>()({ where: { id }, data }))
