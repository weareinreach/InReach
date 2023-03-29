import { cognito, ClientId, generateHash } from './cognitoClient'

export const resetPassword = async ({ code, email, password }: ResetPasswordParams) => {
	const response = await cognito.confirmForgotPassword({
		ClientId,
		ConfirmationCode: code,
		Password: password,
		Username: email,
		SecretHash: generateHash(email),
	})
	return response
}

interface ResetPasswordParams {
	email: string
	password: string
	code: string
}
