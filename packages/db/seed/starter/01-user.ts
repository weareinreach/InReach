import type { ListrRenderer, ListrTaskWrapper } from 'listr2'

import { prisma } from '~/client'

import { localeCode, seedUser, userEmail, userType } from '../data/user'
import { logFile } from '../logger'

export const seedSystemUser = async (task: ListrTaskWrapper<unknown, typeof ListrRenderer>) => {
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
		task.output = `System user created`
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
		task.output = `Updating createdBy/updatedBy for 'Language (${localeCode})'`
		await prisma.language.update({
			where: {
				localeCode: localeCode,
			},
			data: updateData,
		})
		logFile.log(`Updating createdBy/updatedBy for 'UserType (${userType})'`)
		task.output = `Updating createdBy/updatedBy for 'UserType (${userType})'`
		await prisma.userType.update({
			where: {
				type: userType,
			},
			data: updateData,
		})
		logFile.log(`Updating createdBy/updatedBy for 'UserRole (${userType})'`)
		task.output = `Updating createdBy/updatedBy for 'UserRole (${userType})'`
		await prisma.userRole.update({
			where: {
				name: userType,
			},
			data: updateData,
		})
	} catch (err) {
		logFile.error(err)
		throw err
	}
}
