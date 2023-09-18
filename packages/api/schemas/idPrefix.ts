import { z } from 'zod'

import { type IdPrefix, idPrefix } from '@weareinreach/db/lib/idGen'

export const prefixedId = (model: IdPrefix) => z.string().regex(new RegExp(`^${idPrefix[model]}_\\w+$`))
