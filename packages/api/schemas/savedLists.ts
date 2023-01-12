import { z } from 'zod'

export const listId = z.object({ id: z.string().cuid() })
export const listIdOrgId = z.object({ listId: z.string().cuid(), organizationId: z.string().cuid() })
export const listIdServiceId = z.object({ listId: z.string().cuid(), serviceId: z.string().cuid() })
