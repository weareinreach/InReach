import { Prisma } from '~db/client'
import { prisma } from '~db/index'
import { migrateLog } from '~db/seed/logger'
import { ListrTask } from '~db/seed/migrate-v1'

export const batchTransact = async (
	task: ListrTask,
	transactions: Prisma.PrismaPromise<unknown>[],
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

		const result = await prisma.$transaction(batch)
		logMessage = `\tBatch result: ${JSON.stringify(result)}`
		migrateLog.info(logMessage)
		countB++
		countA = countA + batch.length
	}
	return countA
}
