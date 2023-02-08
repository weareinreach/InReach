import { Prisma } from '@weareinreach/db'
import { z } from 'zod'

export const CreateOrgSocialMediaSchema = z.object({
	username: z.string(),
	url: z.string().url(),
	published: z.boolean().default(false),
	serviceId: z.string(),
})

export const CreateNestedOrgSocialMediaSchema = CreateOrgSocialMediaSchema.array().transform((data) =>
	Prisma.validator<Prisma.OrgSocialMediaCreateNestedManyWithoutOrganizationInput>()({
		createMany: {
			skipDuplicates: true,
			data: data.map(({ username, url, published, serviceId }) => ({ username, url, published, serviceId })),
		},
	})
)

// export const CreateNestedOrgSocialMediaPrisma = (data?: z.infer<typeof CreateNestedOrgSocialMediaSchema>) => {
// 	if (!data) return undefined

// 	return Prisma.validator<Prisma.OrgSocialMediaCreateNestedManyWithoutOrganizationInput>()({
// 		createMany: {
// 			skipDuplicates: true,
// 			data: data.map(({ username, url, published, serviceId }) => ({ username, url, published, serviceId })),
// 		},
// 	})
// }
