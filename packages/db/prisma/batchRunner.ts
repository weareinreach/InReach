import { prisma, type Prisma } from '~db/.'
import { type PassedTask } from '~db/prisma/dataMigrationRunner'

const isSuccess = (criteria: unknown) => (criteria ? '✅' : '❎')
const BATCH_SIZE = 500

export const batchRunner: BatchRunner = async (batch, task, batchDescription) => {
	let i = 1
	let ttl = 0
	const totalBatches = Math.ceil(batch.length / BATCH_SIZE)
	if (batchDescription) {
		task.output = `Running batches for: ${batchDescription}`
		task.output = `  ${batch.length} total transactions will be split in to ${totalBatches} batches`
	} else {
		task.output = `Batch runner: ${batch.length} total transactions will be split in to ${totalBatches} batches`
	}

	while (batch.length) {
		const currentBatch = batch.splice(0, BATCH_SIZE)
		task.output = `[${i}/${totalBatches}] Processing records ${ttl + 1} - ${ttl + currentBatch.length}`
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
type BatchRunner = <T extends Prisma.PrismaPromise<any>[]>(
	batch: T,
	task: PassedTask | Omit<PassedTask, 'skip' | 'enabled'>,
	batchDescription?: string
) => Promise<number>
