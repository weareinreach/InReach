import { Prisma } from '@weareinreach/db'
import { z } from 'zod'

export const CreateSource = z.object({
	source: z.string(),
})
