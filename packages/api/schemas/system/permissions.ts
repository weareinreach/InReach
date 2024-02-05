import { z } from 'zod'

import { Prisma } from '@weareinreach/db'

import { CreationBase } from '../common'

const createNewSchema = z.object({
	name: z.string(),
	description: z.string().optional(),
})

export const CreateNew = () => {
	const { dataParser: parser, inputSchema } = CreationBase(createNewSchema)

	const dataParser = parser.transform(({ data, actorId, operation }) =>
		Prisma.validator<Prisma.PermissionCreateArgs>()({
			data: {
				name: data.name,
				description: data.description,
			},
		})
	)

	return { dataParser, inputSchema }
}
