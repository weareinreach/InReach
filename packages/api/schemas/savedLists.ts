import { z } from 'zod'

import { slugSize } from '../lib/nanoIdUrl'

export const listId = z.object({ id: z.string().cuid() })
export const listIdOrgId = z.object({ listId: z.string().cuid(), organizationId: z.string().cuid() })
export const listIdServiceId = z.object({ listId: z.string().cuid(), serviceId: z.string().cuid() })

export const urlSlug = z.object({ slug: z.string().length(slugSize) })

export const createList = z.object({
	name: z.string(),
})
