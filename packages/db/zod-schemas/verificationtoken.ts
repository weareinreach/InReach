import * as z from 'zod'

import * as imports from '../zod-util'

export const _VerificationTokenModel = z.object({
	identifier: z.string(),
	token: z.string(),
	expires: z.date(),
})
