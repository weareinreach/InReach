import { z } from 'zod'

import { getIdPrefixRegex } from '@weareinreach/db'

export const ZHasContactInfoSchema = z
	.string()
	.regex(getIdPrefixRegex('organization', 'orgLocation', 'orgService'))
export type THasContactInfoSchema = z.infer<typeof ZHasContactInfoSchema>
