import { Prisma } from '@weareinreach/db'
import { z } from 'zod'

export const CreateOrgWebsiteSchema = z.object({
	url: z.string().url(),
})

export const CreateNestedOrgWebsiteSchema = CreateOrgWebsiteSchema.array().transform((data) =>
	Prisma.validator<
		Prisma.Enumerable<
			Prisma.OrgWebsiteCreateManyOrganizationInput | Prisma.OrgWebsiteCreateManyOrgLocationInput
		>
	>()(data)
)
