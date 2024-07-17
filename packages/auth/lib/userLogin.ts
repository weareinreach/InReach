import { AuthFlowType } from '@aws-sdk/client-cognito-identity-provider'

import { type AuthResult, ClientId, cognito, generateHash, parseAuthResponse } from './cognitoClient'

export const userLogin: UserLogin = async (email, password) => {
	const response = await cognito.initiateAuth({
		AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
		AuthParameters: {
			USERNAME: email.toLowerCase(),
			PASSWORD: password,
			SECRET_HASH: generateHash(email.toLowerCase()),
		},
		ClientId,
	})
	return parseAuthResponse(response, email.toLowerCase())
}

type UserLogin = (email: string, password: string) => Promise<AuthResult>
