import { z } from 'zod'

import { generateId, generateNestedFreeText, Prisma, slug } from '@weareinreach/db'
import { namespace } from '@weareinreach/db/generated/namespaces'
import { prefixedId } from '~api/schemas/idPrefix'

export const ZCreateSchema = z
	.object({
		orgId: prefixedId('organization'),
		data: z.object({
			number: z.string(),
			ext: z.string().optional(),
			primary: z.boolean().optional(),
			published: z.boolean().optional(),
			countryId: prefixedId('country'),
			phoneTypeId: prefixedId('phoneType').optional(),
			phoneTypeNew: z.string().optional(),
			description: z.string().optional(),
			locationOnly: z.boolean().optional(),
		}),
	})
	.transform(({ data, orgId }) => {
		const id = generateId('orgPhone')
		const description = data.description
			? generateNestedFreeText({ orgId, itemId: id, text: data.description, type: 'phoneDesc' })
			: undefined
		const phoneType = data.phoneTypeId
			? { connect: { id: data.phoneTypeId } }
			: data.phoneTypeNew
			? {
					create: {
						type: data.phoneTypeNew,
						key: {
							create: {
								key: slug(data.phoneTypeNew),
								text: data.phoneTypeNew,
								namespace: { connect: { name: namespace.phoneType } },
							},
						},
					},
			  }
			: undefined

		const { number, ext, locationOnly, primary, published } = data
		return Prisma.validator<Prisma.OrgPhoneCreateInput>()({
			id,
			number,
			ext,
			locationOnly,
			primary,
			published,
			country: { connect: { id: data.countryId } },
			description,
			phoneType,
		})
	})
export type TCreateSchema = z.infer<typeof ZCreateSchema>
