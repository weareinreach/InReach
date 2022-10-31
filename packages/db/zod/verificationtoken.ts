import * as z from 'zod'

export const _VerificationTokenModel = z.object({
	identifier: z.string(),
	token: z.string(),
	expires: z.date(),
})
