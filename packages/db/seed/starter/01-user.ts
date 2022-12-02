import slugify from 'slugify'

import { prisma } from '~/index'
import { namespaces } from '~/seed/data'
import { ListrTask } from '~/seed/starterData'

import { seedUser, userEmail, userRoleList } from '../data'
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
		const logMessage = `System user created`
		logFile.info(logMessage)
		task.output = logMessage
		task.title = `System user (1 record)`
	} catch (err) {
		logFile.error(err)
		throw err
	}
}

export const seedUserTypes = async (task: ListrTask) => {
	let logMessage = ``
	let countA = 1

	const bulkTransactions = userRoleList.map((role) => {
		logMessage = `(${countA}/${userRoleList.length}) Upserting User Type: ${role.name}`
		logFile.info(logMessage)
		task.output = logMessage
		countA++
		return prisma.userType.upsert({
			where: {
				type: role.type,
			},
			create: {
				type: role.type,
				key: {
					create: {
						key: role.type,
						text: role.name,

						namespace: {
							connect: {
								name: namespaces.user,
							},
						},
					},
				},
			},
			update: {},
		})
	})

	await prisma.$transaction(bulkTransactions)
	// userTypes.map((transaction) => {
	// 	logMessage = `(${countA}/${userTypes.length}) Upserting User Type: ${transaction.create.key?.create?.text}`
	// 	logFile.info(logMessage)
	// 	task.output = logMessage
	// 	countA++
	// 	return prisma.userType.upsert(transaction)
	// })
	task.title = `User Types (${userRoleList.length} records)`
}
export const seedUserRoles = async (task: ListrTask) => {
	let logMessage = ``
	let countA = 1
	const bulkTransactions = userRoleList.map((role) => {
		logMessage = `(${countA}/${userRoleList.length}) Upserting User Role: ${role.name}`
		logFile.info(logMessage)
		task.output = logMessage
		countA++

		return prisma.userRole.upsert({
			where: {
				name: role.name,
			},
			create: {
				name: role.name,
				tag: slugify(role.name),
			},
			update: {},
		})
	})

	// userRoles.map((transaction) => {
	// 	logMessage = `(${countA}/${userRoles.length}) Upserting User Role: ${transaction.create.name}`
	// 	logFile.info(logMessage)
	// 	task.output = logMessage
	// 	countA++
	// 	return prisma.userRole.upsert(transaction)
	// })

	await prisma.$transaction(bulkTransactions)
	task.title = `User Roles (${userRoleList.length} records)`
}
