import { Prisma } from '@weareinreach/db'
import { z } from 'zod'

import { orgInclude } from './selects/org'

export const orgById = z.object({
	id: z.string().cuid(),
	include: orgInclude,
})
