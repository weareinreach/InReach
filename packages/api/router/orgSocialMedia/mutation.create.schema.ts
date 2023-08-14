import { z } from 'zod'

import { Prisma } from '@weareinreach/db'
import { prefixedId } from '~api/schemas/idPrefix'

export const ZCreateSchema = z
	.object({
		username: z.string(),
		url: z.string(),
		published: z.boolean(),
		serviceId: z.string(),
		organizationId: prefixedId('organization').optional(),
		orgLocationId: prefixedId('orgLocation').optional(),
		orgLocationOnly: z.boolean(),
	})
	.transform((data) => Prisma.validator<Prisma.OrgSocialMediaUncheckedCreateInput>()(data))
export type TCreateSchema = z.infer<typeof ZCreateSchema>
