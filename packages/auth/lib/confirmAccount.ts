import { cognito, ClientId, generateHash } from './cognitoClient'

export const confirmAccount = async (email: string, code: string) => {
	const response = await cognito.confirmSignUp({
		ClientId,
		ConfirmationCode: code,
		Username: email,
		SecretHash: generateHash(email),
	})
	return response
}
