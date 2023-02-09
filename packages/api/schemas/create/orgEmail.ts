import { Prisma } from '@weareinreach/db'
import { z } from 'zod'

export const CreateOrgEmailSchema = z.object({
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	primary: z.boolean().default(false),
	email: z.string().email(),
	published: z.boolean().default(false),
})

export const CreateNestedOrgEmailSchema = CreateOrgEmailSchema.array().transform((data) =>
	Prisma.validator<Prisma.Enumerable<Prisma.OrgEmailCreateManyInput>>()(data)
)
