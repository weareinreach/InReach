import { z } from 'zod'

export const ZForgotPasswordSchema = z
	.object({
		email: z.string().email(),
		cognitoMessage: z.string(),
		cognitoSubject: z.string(),
	})
	.transform(({ email, cognitoMessage, cognitoSubject }) => ({
		email,
		subject: cognitoSubject,
		message: cognitoMessage,
	}))
export type TForgotPasswordSchema = z.infer<typeof ZForgotPasswordSchema>
