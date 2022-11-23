import { prisma } from '~/index'
import { createMeta, namespaces, sogIdentityData } from '~/seed/data/'
import { logFile } from '~/seed/logger'
import { ListrTask } from '~/seed/starterData'

export const seedSOGIdentity = (task: ListrTask) => {
	try {
		let logMessage = ''
		const transactions = sogIdentityData.map((record, idx) => {
			logMessage = `(${idx + 1}/${sogIdentityData.length}) Upserting SOG/Identity record: ${record.text}`
			logFile.log(logMessage)
			task.output = logMessage

			return prisma.userSOGIdentity.upsert({
				where: {
					identifyAs: record.text,
				},
				create: {
					identifyAs: record.text,
					translationKey: {
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
					...createMeta,
				},
				update: {},
			})
		})
		logMessage = `SOG/Identity records added: ${transactions.length}`
		logFile.log(logMessage)
		task.output = logMessage
		task.title = `SOG/Identity (${transactions.length} records)`
	} catch (error) {
		throw error
	}
}
