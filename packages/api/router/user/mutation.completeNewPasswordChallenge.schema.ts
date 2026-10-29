import { z } from 'zod'

export const ZCompleteNewPasswordChallengeSchema = z.object({
	email: z.string().email().toLowerCase(),
	temporaryPassword: z.string(),
	newPassword: z.string(),
})
export type TCompleteNewPasswordChallengeSchema = z.infer<typeof ZCompleteNewPasswordChallengeSchema>
