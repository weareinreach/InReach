import { z } from 'zod'

const cuid = z.string().cuid()

export const id = z.object({ id: cuid })
export const userId = z.object({ userId: cuid })
export const orgId = z.object({ orgId: cuid })
export const orgIdServiceId = orgId.extend({ serviceId: cuid })
export const orgIdLocationId = orgId.extend({ locationId: cuid })

export const searchTerm = z.object({ search: z.string() })
