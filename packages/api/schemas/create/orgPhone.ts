import { z } from 'zod'

import { generateId, generateNestedFreeText, Prisma, slug } from '@weareinreach/db'
import { namespace as namespaces } from '@weareinreach/db/generated/namespaces'

export const CreateOrgPhoneSchema = z
	.object({
		orgId: z.string(),
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

export const CreateNestedOrgPhoneSchema = z
	.object({
		number: z.string(),
		ext: z.string().nullish(),
		primary: z.boolean().default(false),
		published: z.boolean().default(false),
		countryId: z.string(),
		phoneTypeId: z.string().optional(),
		locationOnly: z.boolean().default(false),
	})
	.array()
	.transform((data) => Prisma.validator<Prisma.Enumerable<Prisma.OrgPhoneCreateManyInput>>()(data))

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

export const UpsertManyOrgPhoneSchema = z.object({
	orgId: z.string(),
	data: z
		.object({
			id: z.string().optional(),
			number: z.string(),
			ext: z.string().nullish(),
			country: z.object({ id: z.string(), cca2: z.string() }),
			phoneType: z.string().nullish(),
			primary: z.boolean(),
			published: z.boolean(),
			deleted: z.boolean(),
			locations: z.string().array(),
			services: z.string().array(),
			description: z.string().optional(),
		})
		.array(),
})
