import { cognito } from './cognitoClient'

export const deleteAccount = async (email: string) => {
	const deactivate = cognito.adminDisableUser({
		UserPoolId: process.env.COGNITO_USER_POOL_ID,
		Username: email,
	})

	return deactivate
}
