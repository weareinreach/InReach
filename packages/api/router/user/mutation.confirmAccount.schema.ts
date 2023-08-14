import { z } from 'zod'

import { decodeUrl } from '~api/lib/encodeUrl'

export const ZConfirmAccountSchema = z
	.object({
		data: z.string(),
		code: z.string(),
	})
	.transform(({ data, code }) => ({ code, ...decodeUrl(data) }))
export type TConfirmAccountSchema = z.infer<typeof ZConfirmAccountSchema>
