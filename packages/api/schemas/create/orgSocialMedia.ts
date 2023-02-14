import { Prisma } from '@weareinreach/db'
import { z } from 'zod'

export const CreateOrgSocialMediaSchema = z.object({
	username: z.string(),
	url: z.string().url(),
	published: z.boolean().default(false),
	serviceId: z.string(),
})

export const CreateNestedOrgSocialMediaSchema = CreateOrgSocialMediaSchema.array().transform((data) =>
	Prisma.validator<
		Prisma.Enumerable<
			Prisma.OrgSocialMediaCreateManyOrganizationInput | Prisma.OrgSocialMediaCreateManyOrgLocationInput
		>
	>()(data)
)
