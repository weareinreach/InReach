import { z } from 'zod'

import { createLoggerInstance } from '@weareinreach/util/logger'

import { ClientId, cognito, generateHash } from './cognitoClient'
import { getBaseUrl } from './getBaseUrl'

const logger = createLoggerInstance('Cognito forgotPassword')

const ForgotPasswordSchema = z.object({
	email: z.string().email().toLowerCase(),
	subject: z.string().default('Reset your password'),
	message: z.string().default('Click the following link to reset your password:'),
})
export const forgotPassword = async (data: ForgotPasswordParams) => {
	const { email, message, subject } = ForgotPasswordSchema.parse(data)

	const response = await cognito.forgotPassword({
		ClientId,
		Username: email.toLowerCase(),
		SecretHash: generateHash(email.toLowerCase()),
		ClientMetadata: { baseUrl: getBaseUrl(), message, subject },
	})

	return response
}

/**
 * Public, unauthenticated self-service entry point - never throws, never reveals whether the email has no
 * account, an unconfirmed account (Cognito refuses to reset a password for one), or a confirmed account that
 * the reset actually went out to. See `resendCode.ts`'s `resendVerificationCodeSafe` for the same pattern
 * applied to the sibling endpoint.
 */
export const forgotPasswordSafe = async (data: ForgotPasswordParams): Promise<{ success: true }> => {
	try {
		await forgotPassword(data)
	} catch (err) {
		logger.error(err)
	}
	return { success: true }
}

type ForgotPasswordParams = {
	email: string
	subject: string
	message: string
}
