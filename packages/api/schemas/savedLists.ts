import { z } from 'zod'

import { slugSize } from '../lib/nanoIdUrl'

export const schemas = {
	listId: z.object({ id: z.string().cuid() }),
	listIdOrgId: z.object({ listId: z.string().cuid(), organizationId: z.string().cuid() }),
	listIdServiceId: z.object({ listId: z.string().cuid(), serviceId: z.string().cuid() }),
	urlSlug: z.object({ slug: z.string().length(slugSize) }),
	createList: z.object({ name: z.string() }),
	createAndSaveOrg: z.object({ listName: z.string(), organizationId: z.string().cuid() }),
	createAndSaveService: z.object({ listName: z.string(), serviceId: z.string().cuid() }),
}
