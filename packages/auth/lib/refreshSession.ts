import { AuthFlowType } from '@aws-sdk/client-cognito-identity-provider'
import { prisma } from '@weareinreach/db'

import { cognito, parseAuthResponse, type AuthResult, ClientId, generateHash } from './cognitoClient'

export const refreshSession = async (userId: string) => {
	const { refresh_token: RefreshToken, email } = await prisma.user_refresh_token.findFirstOrThrow({
		where: { id: userId },
		select: { refresh_token: true, email: true },
	})

	if (!RefreshToken) throw new Error('Unable to get Refresh Token')

	const response = await cognito.initiateAuth({
		AuthFlow: AuthFlowType.REFRESH_TOKEN,
		ClientId,
		AuthParameters: {
			REFRESH_TOKEN: RefreshToken,
			SECRET_HASH: generateHash(email),
		},
	})
	const parsedReponse = await parseAuthResponse(response, email)
	if (parsedReponse.success !== true) {
		throw new Error('Unable to refresh token')
	}

	return parsedReponse.user
}
