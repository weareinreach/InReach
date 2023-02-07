import { Prisma } from '@weareinreach/db'
import { z } from 'zod'

export const CreateOrgWebsiteSchema = z.object({
	url: z.string().url(),
})

export const CreateNestedOrgWebsiteSchema = CreateOrgWebsiteSchema.array()

export const CreateNestedOrgWebsitePrisma = (data?: z.infer<typeof CreateNestedOrgWebsiteSchema>) => {
	if (!data) return undefined

	return Prisma.validator<Prisma.OrgWebsiteCreateNestedManyWithoutOrganizationInput>()({
		createMany: {
			skipDuplicates: true,
			data: data.map(({ url }) => ({ url })),
		},
	})
}
