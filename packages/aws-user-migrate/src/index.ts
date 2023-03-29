import { prisma } from '@weareinreach/db'
import { UserMigrationTriggerEvent, UserMigrationTriggerHandler } from 'aws-lambda'

import { getUser } from './getUser'
import { logger } from './logger'
import { verifyUser } from './verifyUser'

export const handler: UserMigrationTriggerHandler = async (event: UserMigrationTriggerEvent) => {
	// const provider = new CognitoIdentityServiceProvider()
	const email = event.userName
	const password = event.request.password

	switch (event.triggerSource) {
		case 'UserMigration_Authentication':
			try {
				logger.info('Migration trigger')
				const userResult = await verifyUser(email, password)

				if (userResult.valid) {
					event.response.userAttributes = {
						email,
						email_verified: 'true',
						'custom:id': userResult.id,
					}
					event.response.finalUserStatus = 'CONFIRMED'
					event.response.messageAction = 'SUPPRESS'
					await prisma.user.update({
						where: {
							email,
						},
						data: {
							legacyHash: null,
							legacySalt: null,
							migrateDate: new Date(),
						},
					})
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
				logger.info('Forgot Password trigger')
				const userProfile = await getUser(email)
				if (userProfile) {
					event.response.userAttributes = {
						email: userProfile.email,
						email_verified: 'true',
						'custom:id': userProfile.id,
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
