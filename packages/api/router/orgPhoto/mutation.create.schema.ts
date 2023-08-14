import { z } from 'zod'

import { Prisma } from '@weareinreach/db'
import { prefixedId } from '~api/schemas/idPrefix'

export const ZCreateSchema = z
	.object({
		src: z.string(),
		height: z.number().optional(),
		width: z.number().optional(),
		published: z.boolean(),
		orgId: prefixedId('organization').optional(),
		orgLocationId: prefixedId('orgLocation').optional(),
	})
	.transform((data) => {
		const { src, height, width, published, orgId, orgLocationId } = data
		return Prisma.validator<Prisma.OrgPhotoUncheckedCreateInput>()({
			src,
			height,
			width,
			published,
			orgId,
			orgLocationId,
		})
	})
export type TCreateSchema = z.infer<typeof ZCreateSchema>
