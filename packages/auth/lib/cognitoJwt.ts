import { getEnv } from '@weareinreach/config/env'
import { CognitoJwtVerifier } from 'aws-jwt-verify'

import { cognito } from './cognitoClient'

const verifier = (tokenUse: 'access' | 'id') =>
	CognitoJwtVerifier.create({
		userPoolId: 'us-east-1_06XOmcvrs',
		clientId: getEnv('COGNITO_CLIENT_ID'),
		tokenUse,
	})

export const decodeCognitoJwt = async (tokenUse: 'access' | 'id', jwt: string) =>
	await verifier(tokenUse).verify(jwt)
