import { ChallengeNameType } from '@aws-sdk/client-cognito-identity-provider'

import { type AuthResult, ClientId, cognito, generateHash, parseAuthResponse } from './cognitoClient'

export const changePasswordResponse: ChangePasswordResponse = async (
	email,
	newPassword,
	challengeSession
) => {
	const response = await cognito.respondToAuthChallenge({
		ChallengeName: ChallengeNameType.NEW_PASSWORD_REQUIRED,
		ClientId,
		ChallengeResponses: {
			USERNAME: email,
			NEW_PASSWORD: newPassword,
			SECRET_HASH: generateHash(email),
		},
		Session: challengeSession,
	})

	return parseAuthResponse(response, email)
}

type ChangePasswordResponse = (
	email: string,
	password: string,
	challengeSession: string
) => Promise<AuthResult>
