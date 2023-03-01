import { Prisma } from '@weareinreach/db'
import { z } from 'zod'

import { idString } from './common'

export const Connect = {
	email: z.object({ email: z.string().email() }),
	name: z.object({ name: z.string() }),
	tag: z.object({ tag: z.string() }),
	id: z.object({ id: idString }),
}
