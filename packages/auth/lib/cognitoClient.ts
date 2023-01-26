import {
	CognitoIdentityProvider,
	InitiateAuthCommandOutput,
	RespondToAuthChallengeCommandOutput,
	AuthenticationResultType,
	ChallengeNameType,
} from '@aws-sdk/client-cognito-identity-provider'
import { getEnv } from '@weareinreach/config/env'
import { type User } from 'next-auth'
import invariant from 'tiny-invariant'

import { createHmac } from 'crypto'

import { generateUserSession } from './genUserSession'

export const cognito = new CognitoIdentityProvider({
	credentials: {
		accessKeyId: getEnv('COGNITO_ACCESS_KEY'),
		secretAccessKey: getEnv('COGNITO_SECRET'),
	},
})
export const ClientId = getEnv('COGNITO_CLIENT_ID')

/**
 * Generates Cognito HMAC hash.
 *
 * **Function will suffix message with Cognito ClientID automatically**
 *
 * `"{message}[COGNITO_CLIENT_ID]" => {hash}`
 *
 * @param {string} message - The message to be hashed.
 * @returns AWS compliant HMAC hash
 */
export const generateHash = (message: string) =>
	createHmac('sha256', getEnv('COGNITO_CLIENT_SECRET')).update(`${message}${ClientId}`).digest('base64')

export const parseAuthResponse: AuthResponse = async (response, email) => {
	const isChallenge = (name: string | undefined): name is ChallengeNameType =>
		Object.values(ChallengeNameType).includes(name as ChallengeNameType)
	if (response.AuthenticationResult) {
		return {
			success: true,
			session: response.AuthenticationResult,
			user: await generateUserSession(email),
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

type AuthResponse = (
	response: InitiateAuthCommandOutput | RespondToAuthChallengeCommandOutput,
	email: string
) => Promise<AuthResult>

export type AuthResult = AuthSuccess | AuthFailed | AuthChallenge
export interface AuthSuccess {
	success: true
	session: AuthenticationResultType
	user: User
}
interface AuthFailed {
	success: false
	session: undefined
	user: undefined
}
interface AuthChallenge {
	success: undefined
	challengeName: ChallengeNameType
	challengeParams: Record<string, string>
	challengeSession: string
}
