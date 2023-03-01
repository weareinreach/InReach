import { z } from 'zod'

export const cuid = z.string().cuid()
