import { prisma } from '~/index'
import { ListrTask } from '~/seed/starterData'

import {
	localeCode,
	seedUser,
	translationKey,
	translationNamespace,
	userEmail,
	userRoles,
	userType,
	userTypes,
} from '../data/01-user'
import { logFile } from '../logger'

export const seedSystemUser = async (task: ListrTask) => {
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

export const seedUserTypes = async (task: ListrTask) => {
	let logMessage = ``
	let countA = 1
	await prisma.$transaction(
		userTypes.map((transaction) => {
			logMessage = `(${countA}/${userTypes.length}) Upserting User Type: ${transaction.create.translationKey?.create?.text}`
			logFile.info(logMessage)
			task.output = logMessage
			countA++
			return prisma.userType.upsert(transaction)
		})
	)
	task.title = `User Types (${userTypes.length} records)`
}
export const seedUserRoles = async (task: ListrTask) => {
	let logMessage = ``
	let countA = 1
	await prisma.$transaction(
		userRoles.map((transaction) => {
			logMessage = `(${countA}/${userRoles.length}) Upserting User Role: ${transaction.create.name}`
			logFile.info(logMessage)
			task.output = logMessage
			countA++
			return prisma.userRole.upsert(transaction)
		})
	)
	task.title = `User Roles (${userRoles.length} records)`
}
