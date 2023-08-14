import { z } from 'zod'

import { decodeUrl } from '~api/lib/encodeUrl'

export const ZResetPasswordSchema = z
	.object({
		data: z.string(),
		code: z.string(),
		password: z.string(),
	})
	.transform(({ data, password, code }) => ({ password, code, ...decodeUrl(data) }))
export type TResetPasswordSchema = z.infer<typeof ZResetPasswordSchema>
