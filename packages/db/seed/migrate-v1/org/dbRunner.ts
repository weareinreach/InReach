import { readFileSync } from 'fs'
import superjson from 'superjson'

import { prisma } from '~/index'
import { Log, iconList } from '~/seed/lib'
import { migrateLog } from '~/seed/logger'
import { ListrTask } from '~/seed/migrate-v1'
import { getClient, migrateClient } from '~/seed/migrate-v1/org/clients'
import { compare, writeOutDiff } from '~/seed/migrate-v1/org/compare'
// import { rollbackFile } from '~/seed/migrate-v1/org/generator'
import { BatchNames, OutData, batchNameMap, getFileName } from '~/seed/migrate-v1/org/outData'
import { ZodInputs } from '~/seed/migrate-v1/org/zod'

const batchSize = 10_000

export const interactiveRun = async (task: ListrTask) => {
	const log: Log = (message, icon?, indent = false, silent = false) => {
		const dispIcon = icon ? `${iconList(icon)} ` : ''
		const formattedMessage = `${indent ? '\t' : ''}${dispIcon}${message}`
		migrateLog.info(formattedMessage)
		if (!silent) task.output = formattedMessage
	}
	const loadData = <K extends BatchNames, S extends OutData[K]>(batchName: K) => {
		const batchFile = getFileName(batchName)
		const [...data] = superjson.parse<S>(readFileSync(batchFile, 'utf-8'))
		return data
	}
	await prisma.$transaction(
		async (tx) => {
			for (const key of Object.keys(migrateClient)) {
				const batchName = key as BatchNames
				const client = getClient(batchName)
				const fileData = loadData(batchName) as ZodInputs[typeof batchName]
				let counter = 1
				let records = 0
				const submittedTotal = fileData.length
				const totalBatches = Math.ceil(submittedTotal / batchSize)
				const description = batchNameMap.get(batchName)
				log(`Running batches for ${description}. Generated records: ${submittedTotal}`, 'gear')
				while (fileData.length) {
					const batchData = fileData.splice(0, batchSize)
					const result = await client(tx, batchData)
					records += result.count
					const skipped = batchData.length - result.count
					log(
						`[${counter}/${totalBatches}] ${description}: Submitted: ${batchData.length}. Inserted: ${result.count}. Skipped: ${skipped}`,
						'write',
						true
					)
					if (skipped > 0) {
						compare(tx, batchData, batchName)
					}
					counter++
				}
				log(
					`Records submitted: ${submittedTotal}, records created: ${records}, records skipped/not created: ${
						submittedTotal - records
					}`,
					'create'
				)
			}
			writeOutDiff()
		},
		{
			timeout: 180_000,
		}
	)
}
