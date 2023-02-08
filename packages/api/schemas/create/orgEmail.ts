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
	Prisma.validator<Prisma.OrgEmailCreateNestedManyWithoutOrganizationInput>()({
		createMany: {
			data: data.map(({ firstName, lastName, primary, email, published }) => ({
				firstName,
				lastName,
				primary,
				email,
				published,
			})),
			skipDuplicates: true,
		},
	})
)

// export const CreateNestedOrgEmailPrisma = (data?: z.infer<typeof CreateNestedOrgEmailSchema>) => {
// 	if (!data) return undefined

// 	return Prisma.validator<Prisma.OrgEmailCreateNestedManyWithoutOrganizationInput>()({
// 		createMany: {
// 			data: data.map(({ firstName, lastName, primary, email, published }) => ({
// 				firstName,
// 				lastName,
// 				primary,
// 				email,
// 				published,
// 			})),
// 			skipDuplicates: true,
// 		},
// 	})
// }
