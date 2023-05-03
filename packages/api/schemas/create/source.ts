import { z } from 'zod'
import { Prisma } from '@weareinreach/db'

export const CreateSource = z.object({
	source: z.string(),
})
