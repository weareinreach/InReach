import { ClientId, cognito, generateHash } from './cognitoClient'

export const resendVerificationCode = async (email: string) => {
	const response = await cognito.resendConfirmationCode({
		ClientId,
		Username: email.toLowerCase(),
		SecretHash: generateHash(email.toLowerCase()),
	})
	return response
}
