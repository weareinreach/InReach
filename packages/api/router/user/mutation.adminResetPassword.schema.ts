import { z } from 'zod'

export const ZAdminResetPasswordSchema = z
	.object({
		email: z.string().email().toLowerCase(),
		cognitoMessage: z.string(),
		cognitoSubject: z.string(),
	})
	.transform(({ email, cognitoMessage, cognitoSubject }) => ({
		email,
		subject: cognitoSubject,
		message: cognitoMessage,
	}))
export type TAdminResetPasswordSchema = z.infer<typeof ZAdminResetPasswordSchema>
