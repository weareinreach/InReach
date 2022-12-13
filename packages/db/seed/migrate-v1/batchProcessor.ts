import { PrismaPromise } from '@prisma/client'

import { prisma } from '~/index'
import { migrateLog } from '~/seed/logger'
import { ListrTask } from '~/seed/migrate-v1'

export const batchTransact = async (
	task: ListrTask,
	transactions: PrismaPromise<unknown>[],
	batchSize = 1
) => {
	let countA = 0
	let countB = 0
	let logMessage = ``
	const totalRecords = transactions.length
	const totalBatches = Math.ceil(transactions.length / batchSize)
	if (!transactions.length) task.skip('No transactions')

	while (transactions.length) {
		const batch = transactions.splice(0, batchSize)
		logMessage = `Batch ${countB} of ${totalBatches}: Processing records ${countA + 1} to ${
			countA + batch.length
		} of ${totalRecords}`
		migrateLog.info(logMessage)
		task.output = logMessage
		// const batchProcess = batch.map((record) => prisma.user.upsert(record))
		await prisma.$transaction(batch)
		countB++
		countA = countA + batch.length
	}
	return countA
}
