import superjson from 'superjson'

import fs from 'fs'
import path from 'path'

import { prisma, type Prisma } from '~db/client'
import { attachLogger, formatMessage } from '~db/seed/recon/lib/logger'
import {
	type BatchData,
	createBatchNames,
	type CreateBatchNames,
	getBatchFile,
	updateBatchNames,
	type UpdateBatchNames,
} from '~db/seed/recon/lib/output'
import { type ListrJob } from '~db/seed/recon/lib/types'

const loadBatch = <
	O extends 'create' | 'update',
	const B extends O extends 'create' ? CreateBatchNames : UpdateBatchNames
>(
	op: O,
	batchName: B
) => {
	const fileName = getBatchFile({ type: op, batchName })
	if (!fs.existsSync(fileName)) return

	const data = superjson.parse<BatchData<typeof op, typeof batchName>>(fs.readFileSync(fileName, 'utf-8'))

	return [...data]
}

const isValidPrismaModel = (model: string | symbol): model is keyof typeof prisma => model in prisma

const writeBatchDebug = (data: object) =>
	fs.writeFileSync(path.resolve(__dirname, './output/currentBatch.json'), JSON.stringify(data))
export const dbRun = {
	title: 'Insert/Update records to DB',
	task: async (_ctx, task) => {
		attachLogger(task)
		const log = (...args: Parameters<typeof formatMessage>) => (task.output = formatMessage(...args))

		const createManyBatchSize = 10 //00
		const updateBatchSize = 500
		await prisma.$transaction(
			async (tx) => {
				for (const batchName of createBatchNames) {
					log(`Preparing create/${batchName}`)
					if (!isValidPrismaModel(batchName)) {
						log(`Error: ${batchName} is not a valid Prisma model`)
						continue
					}
					const batchData = loadBatch('create', batchName)
					if (!batchData) {
						log(`Skipping batch create/${batchName}, no data.`)
						continue
					}
					let batchCount = 1
					let recordCount = 0
					const totalBatches = Math.ceil(batchData.length / createManyBatchSize)
					const totalRecords = batchData.length
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					const createMany = tx[batchName].createMany as (args: any) => Promise<Prisma.BatchPayload>
					while (batchData.length) {
						const currentBatch = batchData.splice(0, createManyBatchSize)
						log(
							`[${batchCount}/${totalBatches}] Processing records ${recordCount + 1} to ${
								recordCount + currentBatch.length
							} of ${totalRecords}`
						)
						writeBatchDebug(currentBatch)
						const result = await createMany({ data: currentBatch, skipDuplicates: true })
						const skipped = currentBatch.length - result.count
						log(
							`\t\t\tSubmitted: ${currentBatch.length}. Inserted: ${result.count}. Skipped: ${skipped}`,
							'write'
						)

						batchCount++
						recordCount += currentBatch.length
					}
					log(
						`[${batchCount}/${totalBatches}] Batch "create/${batchName}" complete: Submitted: ${totalRecords}. Inserted: ${recordCount}. Skipped/Not Created: ${
							totalRecords - recordCount
						}`,
						'create'
					)
				}
			},
			{
				timeout: 720_000,
			}
		)
		for (const batchName of updateBatchNames) {
			log(`Preparing update/${batchName}`)
			if (!isValidPrismaModel(batchName)) {
				log(`Error: ${batchName} is not a valid Prisma model`)
				continue
			}
			const batchData = loadBatch('update', batchName)
			if (!batchData) {
				log(`Skipping batch update/${batchName}, no data.`)
				continue
			}
			let batchCount = 1
			let recordCount = 0
			const totalBatches = Math.ceil(batchData.length / updateBatchSize)
			const totalRecords = batchData.length
			while (batchData.length) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const update = prisma[batchName].update as (args: any) => Prisma.PrismaPromise<any>
				const currentBatch = batchData.splice(0, updateBatchSize)
				writeBatchDebug(currentBatch)
				const batchedClients = currentBatch.map((args) => update(args))
				log(
					`[${batchCount}/${totalBatches}] Processing records ${recordCount + 1} to ${
						recordCount + currentBatch.length
					} of ${totalRecords}`
				)
				const result = await prisma.$transaction(batchedClients)
				log(`\t\t\tUpdated: ${result.length}.`, 'write')

				batchCount++
				recordCount += currentBatch.length
			}
			log(
				`[${batchCount}/${totalBatches}] Batch "update/${batchName}" complete: Submitted: ${totalRecords}. Updated: ${recordCount}. Skipped/Not Created: ${
					totalRecords - recordCount
				}`,
				'update'
			)
		}
	},
} satisfies ListrJob
