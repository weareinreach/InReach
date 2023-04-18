import { Prisma } from '@weareinreach/db'
import { z } from 'zod'

export const CreateOrgPhotoSchema = z
	.object({
		src: z.string(),
		height: z.number().optional(),
		width: z.number().optional(),
		published: z.boolean(),
		orgId: z.string().optional(),
		orgLocationId: z.string().optional(),
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

export const UpdateOrgPhotoSchema = z
	.object({
		id: z.string(),
		data: z
			.object({
				src: z.string(),
				height: z.number(),
				width: z.number(),
				published: z.boolean(),
				deleted: z.boolean(),
				orgId: z.string(),
				orgLocationId: z.string(),
			})
			.partial(),
	})
	.transform(({ data, id }) => Prisma.validator<Prisma.OrgPhotoUpdateArgs>()({ where: { id }, data }))
