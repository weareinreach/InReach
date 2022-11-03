import { Subscriber } from 'rxjs'

import { prisma } from '~/client'

import { localeCode, seedUser, userEmail, userType } from '../data/user'
import { logFile } from '../logger'

export const seedSystemUser = async (subscriber: Subscriber<string>) => {
	try {
		// create user if it does not exist.
		await prisma.user.upsert({
			where: {
				email: userEmail,
			},
			update: seedUser,
			create: seedUser,
			select: {
				id: true,
			},
		})
		logFile.info(`System user created`)
		subscriber.next(`System user created`)
		// updated the 'createdBy' and 'updatedBy' fields for 'Language', 'UserType' & 'UserRole
		const updateData = {
			createdBy: {
				connect: {
					email: userEmail,
				},
			},
			updatedBy: {
				connect: {
					email: userEmail,
				},
			},
		}
		logFile.log(`Updating createdBy/updatedBy for 'Language (${localeCode})'`)
		subscriber.next(`Updating createdBy/updatedBy for 'Language (${localeCode})'`)
		await prisma.language.update({
			where: {
				localeCode: localeCode,
			},
			data: updateData,
		})
		logFile.log(`Updating createdBy/updatedBy for 'UserType (${userType})'`)
		subscriber.next(`Updating createdBy/updatedBy for 'UserType (${userType})'`)
		await prisma.userType.update({
			where: {
				type: userType,
			},
			data: updateData,
		})
		logFile.log(`Updating createdBy/updatedBy for 'UserRole (${userType})'`)
		subscriber.next(`Updating createdBy/updatedBy for 'UserRole (${userType})'`)
		await prisma.userRole.update({
			where: {
				name: userType,
			},
			data: updateData,
		})
		subscriber.complete()
	} catch (err) {
		throw subscriber.error(err)
		// logFile.error(err)
	}
}
