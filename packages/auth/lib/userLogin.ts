import { AuthFlowType } from '@aws-sdk/client-cognito-identity-provider'

import { type AuthResult, ClientId, cognito, generateHash, parseAuthResponse } from './cognitoClient'

export const userLogin: UserLogin = async (email, password) => {
	const response = await cognito.initiateAuth({
		AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
		ClientId,
		AuthParameters: {
			USERNAME: email,
			PASSWORD: password,
			SECRET_HASH: generateHash(email),
		},
	})
	return parseAuthResponse(response, email)
}

type UserLogin = (email: string, password: string) => Promise<AuthResult>
