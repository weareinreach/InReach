import { z } from 'zod'

import { Prisma } from '@weareinreach/db'
import { prefixedId } from '~api/schemas/idPrefix'
import { webUrlString } from '~api/schemas/webUrl'

export const ZCreateSchema = z
	.object({
		username: z.string(),
		url: webUrlString(),
		published: z.boolean(),
		serviceId: z.string(),
		organizationId: prefixedId('organization').optional(),
		orgLocationId: prefixedId('orgLocation').optional(),
		orgLocationOnly: z.boolean(),
	})
	.transform((data) => Prisma.validator<Prisma.OrgSocialMediaUncheckedCreateInput>()(data))
export type TCreateSchema = z.infer<typeof ZCreateSchema>
