import { Prisma } from '@weareinreach/db'
import { z } from 'zod'

export const CreateOrgPhoneSchema = z.object({
	number: z.string(),
	ext: z.string().nullish(),
	primary: z.boolean().default(false),
	published: z.boolean().default(false),
	countryId: z.string(),
	phoneTypeId: z.string().optional(),
	locationOnly: z.boolean().default(false),
})

export const CreateNestedOrgPhoneSchema = CreateOrgPhoneSchema.array().transform((data) =>
	Prisma.validator<Prisma.Enumerable<Prisma.OrgPhoneCreateManyInput>>()(data)
)
