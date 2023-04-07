import { prisma, Prisma } from '~db/.'
import { type PassedTask } from '~db/prisma/dataMigrationRunner'

const isSuccess = (criteria: unknown) => (criteria ? '✅' : '❎')
const BATCH_SIZE = 500

export const batchRunner: BatchRunner = async (batch, task) => {
	let i = 1
	let ttl = 0
	const totalBatches = Math.ceil(batch.length / BATCH_SIZE)

	while (batch.length) {
		const currentBatch = batch.splice(0, BATCH_SIZE)
		const batchResult = await prisma.$transaction(currentBatch)
		task.output = `[${i}/${totalBatches}] ${isSuccess(batchResult.length)} Records processed: ${
			batchResult.length
		}`
		ttl += batchResult.length
		i++
	}
	return ttl
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BatchRunner = <T extends Prisma.PrismaPromise<any>[]>(batch: T, task: PassedTask) => Promise<number>
