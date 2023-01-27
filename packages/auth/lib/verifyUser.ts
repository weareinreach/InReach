import { AuthFlowType } from '@aws-sdk/client-cognito-identity-provider'
import { z } from 'zod'

import { cognito, parseAuthResponse, type AuthResult, ClientId, generateHash } from './cognitoClient'

export const verifyUser: VerifyUser = async (email, password) => {
	const response = await cognito.initiateAuth({
		AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
		ClientId,
		AuthParameters: {
			USERNAME: email,
			PASSWORD: password,
			SECRET_HASH: generateHash(email),
		},
	})
	return await parseAuthResponse(response, email)
}

type VerifyUser = (email: string, password: string) => Promise<AuthResult>

export const CognitoSessionSchema = z.object({
	AccessToken: z.string(),
	ExpiresIn: z.number(),
	IdToken: z.string(),
	RefreshToken: z.string(),
	TokenType: z.string(),
})
