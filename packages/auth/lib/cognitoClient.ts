import {
	CognitoIdentityProvider,
	InitiateAuthCommandOutput,
	RespondToAuthChallengeCommandOutput,
	AuthenticationResultType,
	ChallengeNameType,
} from '@aws-sdk/client-cognito-identity-provider'
import invariant from 'tiny-invariant'

import { createHmac } from 'crypto'

export const cognito = new CognitoIdentityProvider({
	credentials: {
		accessKeyId: process.env.COGNITO_ACCESS_KEY,
		secretAccessKey: process.env.COGNITO_SECRET,
	},
})
export const ClientId = process.env.COGNITO_CLIENT_ID

/**
 * Generates Cognito HMAC hash.
 *
 * **Function will suffix message with Cognito ClientID automatically**
 *
 * @param {string} message - The message to be hashed.
 * @returns AWS compliant HMAC hash
 */
export const generateHash = (message: string) =>
	createHmac('sha256', process.env.COGNITO_CLIENT_SECRET).update(`${message}${ClientId}`).digest('base64')

export const parseAuthResponse: AuthResponse = (response) => {
	const isChallenge = (name: string | undefined): name is ChallengeNameType =>
		Object.values(ChallengeNameType).includes(name as ChallengeNameType)
	if (response.AuthenticationResult) {
		return {
			success: true,
			session: response.AuthenticationResult,
		}
	}
	if (isChallenge(response.ChallengeName)) {
		invariant(response.ChallengeParameters)
		invariant(response.Session)
		return {
			success: undefined,
			challengeName: response.ChallengeName,
			challengeParams: response.ChallengeParameters,
			challengeSession: response.Session,
		}
	}
	return {
		success: false,
		session: undefined,
	}
}

type AuthResponse = (response: InitiateAuthCommandOutput | RespondToAuthChallengeCommandOutput) => AuthResult

export type AuthResult = Success | Failed | Challenge
interface Success {
	success: true
	session: AuthenticationResultType
}
interface Failed {
	success: false
	session: undefined
}
interface Challenge {
	success: undefined
	challengeName: ChallengeNameType
	challengeParams: Record<string, string>
	challengeSession: string
}
