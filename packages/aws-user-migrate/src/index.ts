import { UserMigrationTriggerEvent, UserMigrationTriggerHandler } from 'aws-lambda'

import { getUser } from './getUser'
import { logger } from './logger'
import { verifyUser } from './verifyUser'

export const handler: UserMigrationTriggerHandler = async (event: UserMigrationTriggerEvent) => {
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
				if (error instanceof Error) {
					logger.error({ message: error.message }, { name: error.name, stack: error.stack })
				}
				if (typeof error === 'string') {
					logger.error(error)
					throw new Error(error)
				}
				throw error
			}

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
				if (error instanceof Error) {
					logger.error({ message: error.message }, { name: error.name, stack: error.stack })
				}
				if (typeof error === 'string') {
					logger.error(error)
					throw new Error(error)
				}
				throw error
			}

		default:
			throw new Error('Bad triggerSource')
	}
}
