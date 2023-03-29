import { cognito, ClientId, generateHash } from './cognitoClient'
import { getBaseUrl } from './getBaseUrl'

export const forgotPassword: ForgotPassword = async (email) => {
	const response = await cognito.forgotPassword({
		ClientId,
		Username: email,
		SecretHash: generateHash(email),
		ClientMetadata: { baseUrl: getBaseUrl() },
	})

	return response
}

type ForgotPassword = (email: string) => Promise<unknown>
