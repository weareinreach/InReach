import { OrgPhone, Prisma, generateId, generateNestedFreeText, slug } from '@weareinreach/db'
import { namespaces } from '@weareinreach/db/seed/data/00-namespaces'
import { z } from 'zod'

export const CreateOrgPhoneSchema = z
	.object({
		orgSlug: z.string(),
		data: z.object({
			number: z.string(),
			ext: z.string().optional(),
			primary: z.boolean().optional(),
			published: z.boolean().optional(),
			countryId: z.string(),
			phoneTypeId: z.string().optional(),
			phoneTypeNew: z.string().optional(),
			description: z.string().optional(),
			locationOnly: z.boolean().optional(),
		}),
	})
	.transform(({ data, orgSlug }) => {
		const id = generateId('orgPhone')
		const description = data.description
			? generateNestedFreeText({ orgSlug, itemId: id, text: data.description, type: 'phoneDesc' })
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
								namespace: { connect: { name: namespaces.phoneType } },
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

export const UpdateOrgPhoneSchema = z
	.object({
		id: z.string(),
		data: z
			.object({
				number: z.string(),
				ext: z.string(),
				primary: z.boolean(),
				published: z.boolean(),
				deleted: z.boolean(),
				countryId: z.string(),
				phoneTypeId: z.string(),
				locationOnly: z.boolean(),
			})
			.partial(),
	})
	.transform(({ data, id }) => Prisma.validator<Prisma.OrgPhoneUpdateArgs>()({ where: { id }, data }))
