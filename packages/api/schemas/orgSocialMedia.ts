import { Prisma } from '@weareinreach/db'
import { z } from 'zod'

export const CreateOrgSocialSchema = z
	.object({
		username: z.string(),
		url: z.string(),
		published: z.boolean(),
		serviceId: z.string(),
		organizationId: z.string().optional(),
		orgLocationId: z.string().optional(),
		orgLocationOnly: z.boolean(),
	})
	.transform((data) => Prisma.validator<Prisma.OrgSocialMediaUncheckedCreateInput>()(data))

export const UpdateOrgSocialSchema = z
	.object({
		id: z.string(),
		data: z
			.object({
				username: z.string(),
				url: z.string(),
				published: z.boolean(),
				deleted: z.boolean(),
				serviceId: z.string(),
				organizationId: z.string(),
				orgLocationId: z.string(),
				orgLocationOnly: z.boolean(),
			})
			.partial(),
	})
	.transform(({ data, id }) => Prisma.validator<Prisma.OrgSocialMediaUpdateArgs>()({ where: { id }, data }))
