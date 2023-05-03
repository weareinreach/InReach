import { CognitoJwtVerifier } from 'aws-jwt-verify'
import { z } from 'zod'
import { getEnv } from '@weareinreach/config/env'

const verifier = (tokenUse: 'access' | 'id') =>
	CognitoJwtVerifier.create({
		userPoolId: 'us-east-1_06XOmcvrs',
		clientId: getEnv('COGNITO_CLIENT_ID'),
		tokenUse,
	})

const AccessTokenSchema = z
	.object({
		sub: z.string().uuid(),
		iss: z.string(),
		client_id: z.string(),
		token_use: z.literal('access'),
		scope: z.string(),
		auth_time: z.number(),
		exp: z.number(),
		iat: z.number(),
		jti: z.string(),
		username: z.string(),
	})
	.passthrough()

const IdTokenSchema = z
	.object({
		sub: z.string().uuid(),
		email_verified: z.boolean(),
		iss: z.string(),
		'custom:id': z.string(),
		'cognito:username': z.string(),
		aud: z.string(),
		token_use: z.literal('id'),
		auth_time: z.number(),
		exp: z.number(),
		iat: z.number(),
		jti: z.string(),
		email: z.string(),
	})
	.passthrough()

export const decodeCognitoIdJwt = async (jwt: string) => {
	const data = await verifier('id').verify(jwt)
	return IdTokenSchema.parse(data)
}
export const decodeCognitoAccessJwt = async (jwt: string) => {
	const data = await verifier('access').verify(jwt)
	return AccessTokenSchema.parse(data)
}

export const decodeCognitoJwt = async (tokenUse: 'access' | 'id', jwt: string) =>
	await (tokenUse === 'access' ? decodeCognitoAccessJwt(jwt) : decodeCognitoIdJwt(jwt))
