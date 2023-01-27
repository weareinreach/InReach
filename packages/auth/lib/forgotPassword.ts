import { cognito, ClientId, generateHash } from './cognitoClient'

export const forgotPassword: ForgotPassword = async (email) => {
	const response = await cognito.forgotPassword({
		ClientId,
		Username: email,
		SecretHash: generateHash(email),
	})

	return response
}

type ForgotPassword = (email: string) => Promise<unknown>
