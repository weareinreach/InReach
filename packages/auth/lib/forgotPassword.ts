import { z } from 'zod'

import { cognito, ClientId, generateHash } from './cognitoClient'
import { getBaseUrl } from './getBaseUrl'

const ForgotPasswordSchema = z.object({
	email: z.string().email(),
	subject: z.string().default('Reset your password'),
	message: z.string().default('Click the following link to reset your password:'),
})
export const forgotPassword = async (data: ForgotPasswordParams) => {
	const { email, message, subject } = ForgotPasswordSchema.parse(data)

	const response = await cognito.forgotPassword({
		ClientId,
		Username: email,
		SecretHash: generateHash(email),
		ClientMetadata: { baseUrl: getBaseUrl(), message, subject },
	})

	return response
}

type ForgotPasswordParams = {
	email: string
	subject: string
	message: string
}
