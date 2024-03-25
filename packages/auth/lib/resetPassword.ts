import { ClientId, cognito, generateHash } from './cognitoClient'

export const resetPassword = async ({ code, email, password }: ResetPasswordParams) => {
	const response = await cognito.confirmForgotPassword({
		ClientId,
		ConfirmationCode: code,
		Password: password,
		Username: email.toLowerCase(),
		SecretHash: generateHash(email.toLowerCase()),
	})
	return response
}

interface ResetPasswordParams {
	email: string
	password: string
	code: string
}
