import { ClientId, cognito, generateHash } from './cognitoClient'

export const confirmAccount = async (email: string, code: string) => {
	const response = await cognito.confirmSignUp({
		ClientId,
		ConfirmationCode: code,
		Username: email.toLowerCase(),
		SecretHash: generateHash(email),
	})
	return response
}

export { ExpiredCodeException, CodeMismatchException } from '@aws-sdk/client-cognito-identity-provider'
