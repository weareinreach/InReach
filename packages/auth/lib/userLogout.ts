import { prisma } from '@weareinreach/db'

import { cognito } from './cognitoClient'

export const userSignOut = async (userId: string) => {
	const { access_token: AccessToken } = await prisma.user_access_token.findFirstOrThrow({
		where: {
			id: userId,
		},
		select: {
			access_token: true,
		},
	})
	if (!AccessToken) throw new Error('Unable to retrieve Access Token')

	await cognito.globalSignOut({ AccessToken })
}
