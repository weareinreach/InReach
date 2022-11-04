import { UserMigrationTriggerEvent, UserMigrationTriggerHandler } from 'aws-lambda'

import { getUser } from './getUser'
import { verifyUser } from './verifyUser'

const handler: UserMigrationTriggerHandler = async (event: UserMigrationTriggerEvent) => {
	// const provider = new CognitoIdentityServiceProvider()
	const username = event.userName
	const password = event.request.password
	switch (event.triggerSource) {
		case 'UserMigration_Authentication':
			try {
				if (await verifyUser(username, password)) {
					event.response.userAttributes = {
						email: username,
						email_verified: 'true',
					}
					event.response.finalUserStatus = 'CONFIRMED'
					event.response.messageAction = 'SUPPRESS'
					return event
				} else {
					throw new Error('Bad password')
				}
			} catch (error) {
				console.error(error)
				if (typeof error === 'string') throw new Error(error)
				throw error
			}

			break
		case 'UserMigration_ForgotPassword':
			try {
				const userProfile = await getUser(username)
				if (userProfile) {
					event.response.userAttributes = {
						email: userProfile.email,
						email_verified: 'true',
					}
					event.response.messageAction = 'SUPPRESS'
					return event
				} else {
					throw new Error('Bad password')
				}
			} catch (error) {
				console.error(error)
				if (typeof error === 'string') throw new Error(error)
				throw error
			}
			break

		default:
			throw new Error('Bad triggerSource')
	}
}

export default handler
