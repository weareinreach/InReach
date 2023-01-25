import { ChallengeNameType } from '@aws-sdk/client-cognito-identity-provider'

import { ClientId, cognito, generateHash, parseAuthResponse, type AuthResult } from './cognitoClient'

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

	return await parseAuthResponse(response, email)
}

type ChangePasswordResponse = (
	email: string,
	password: string,
	challengeSession: string
) => Promise<AuthResult>
