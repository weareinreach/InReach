import { z } from 'zod'

import { decodeUrl } from '~api/lib/encodeUrl'

export const ZResendCodeSchema = z.union([
	z.object({ email: z.string().email().toLowerCase(), data: z.never().optional() }),
	z
		.object({ data: z.string(), email: z.never().optional() })
		.transform(({ data }) => ({ email: decodeUrl(data).email })),
])

// .object({ email: z.string().email().toLowerCase() })
// .or(z.object({ data: z.string() }))
export type TResendCodeSchema = z.infer<typeof ZResendCodeSchema>
