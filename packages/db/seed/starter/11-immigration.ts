import { prisma } from '~/index'
import { namespaces, userImmigrationData } from '~/seed/data/'
import { logFile } from '~/seed/logger'
import { ListrTask } from '~/seed/starterData'

export const seedUserImmigration = async (task: ListrTask) => {
	try {
		let logMessage = ''
		const transactions = userImmigrationData.map((record, idx) => {
			logMessage = `(${idx + 1}/${userImmigrationData.length}) Upserting User Immigration Status record: ${
				record.text
			}`
			logFile.log(logMessage)
			task.output = logMessage

			return prisma.userImmigration.upsert({
				where: {
					status: record.text,
				},
				create: {
					status: record.text,
					key: {
						create: {
							key: record.key,
							text: record.text,
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
		await prisma.$transaction(transactions)
		logMessage = `User Immigration Status records added: ${transactions.length}`
		logFile.log(logMessage)
		task.output = logMessage
		task.title = `User Immigration Status (${transactions.length} records)`
	} catch (error) {
		throw error
	}
}
