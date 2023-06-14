import { z } from 'zod'

import { ClientId, cognito, generateHash } from './cognitoClient'
import { getBaseUrl } from './getBaseUrl'
import { logger } from './logger'

const ForgotPasswordSchema = z.object({
	email: z.string().email(),
	subject: z.string().default('Reset your password'),
	message: z.string().default('Click the following link to reset your password:'),
})
export const forgotPassword = async (data: ForgotPasswordParams) => {
	const { email, message, subject } = ForgotPasswordSchema.parse(data)

	logger.info('clientId', ClientId)
	const response = await cognito.forgotPassword({
		ClientId,
		Username: email,
		SecretHash: generateHash(email),
		ClientMetadata: { baseUrl: getBaseUrl(), message, subject },
	})

	logger.info(response)

	return response
}

type ForgotPasswordParams = {
	email: string
	subject: string
	message: string
}
