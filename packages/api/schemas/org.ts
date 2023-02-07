import { Prisma } from '@weareinreach/db'
import { z } from 'zod'

import { orgInclude } from './selects/org'

export const orgById = z.object({
	id: z.string().cuid(),
	include: orgInclude,
})

export const CreateOrg = z.object({
	name: z.string(),
	slug: z.string(),
	source: z.string(),
})
