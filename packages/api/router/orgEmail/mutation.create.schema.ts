import { z } from 'zod'

import { generateId, generateNestedFreeText, Prisma, slug } from '@weareinreach/db'
import { namespace } from '@weareinreach/db/generated/namespaces'

export const ZCreateSchema = z
	.object({
		orgId: z.string(),
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
	.transform(({ orgId, data, title, titleId, description }) => {
		const id = generateId('orgEmail')

		return Prisma.validator<Prisma.OrgEmailCreateInput>()({
			...data,
			description: description
				? generateNestedFreeText({ orgId, itemId: id, text: description, type: 'emailDesc' })
				: undefined,
			title: title
				? {
						create: {
							title,
							key: {
								create: {
									text: title,
									key: slug(title),
									namespace: { connect: { name: namespace.userTitle } },
								},
							},
						},
				  }
				: titleId
				? { connect: { id: titleId } }
				: undefined,
		})
	})
export type TCreateSchema = z.infer<typeof ZCreateSchema>
