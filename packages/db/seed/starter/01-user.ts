import type { ListrRenderer, ListrTaskWrapper } from 'listr2'

import { prisma } from '~/index'

import { localeCode, seedUser, translationKey, translationNamespace, userEmail, userType } from '../data/user'
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
		let logMessage = `System user created`
		logFile.info(logMessage)
		task.output = logMessage
		task.title = `System user (1 record)`
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
		logMessage = `Updating createdBy/updatedBy for 'Language (${localeCode})'`
		logFile.info(logMessage)
		task.output = logMessage
		await prisma.language.update({
			where: {
				localeCode: localeCode,
			},
			data: updateData,
		})
		logMessage = `Updating createdBy/updatedBy for 'Translation Namespace: ${translationNamespace}'`
		logFile.info(logMessage)
		task.output = logMessage
		const namespaceUpdate = await prisma.translationNamespace.update({
			where: {
				name: translationNamespace,
			},
			data: updateData,
		})
		logMessage = `Updating createdBy/updatedBy for 'Translation Key: ${namespaceUpdate.name}.${translationKey}'`
		logFile.info(logMessage)
		task.output = logMessage
		await prisma.translationKey.update({
			where: {
				key_namespaceId: {
					key: translationKey,
					namespaceId: namespaceUpdate.id,
				},
			},
			data: updateData,
		})
		logMessage = `Updating createdBy/updatedBy for 'User Type (${userType})'`
		logFile.info(logMessage)
		task.output = logMessage
		await prisma.userType.update({
			where: {
				type: userType,
			},
			data: updateData,
		})
		logMessage = `Updating createdBy/updatedBy for 'User Role (${userType})'`
		logFile.info(logMessage)
		task.output = logMessage
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
