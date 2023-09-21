import { Listr } from 'listr2'
import PQueue from 'p-queue'
import ms from 'pretty-ms'

import fs from 'fs'
import path from 'path'

import { getStringIdByKey } from '@weareinreach/crowdin/api'
import { prisma } from '~db/client'

const queue = new PQueue({
	concurrency: 15,
	intervalCap: 15,
	interval: 500,
	autoStart: false,
	carryoverConcurrencyCount: true,
})
const errorOut: unknown[] = []
let qtotal = 0
let qcount = 0
let qerror = 0
// let qtimer: number

const output: { crowdinId: number; key: string; ns: string }[] = []

queue.on('error', (error) => {
	console.error(error)
})
queue.on('idle', () => {
	// console.info(`<==> Writing data to file.`)
	fs.writeFileSync(path.resolve(__dirname, './generated/out.json'), JSON.stringify(output))
	if (errorOut.length) {
		fs.writeFileSync(path.resolve(__dirname, './generated/errors.json'), JSON.stringify(errorOut, null, 1))
	}
	// console.info(`🏁 🏁 Work queue finished! 🏁 🏁`)
})

const task = async (key: string, ns: string) => {
	const crowdinId = await getStringIdByKey(key, ns === 'org-data')
	if (!crowdinId) {
		errorOut.push({ crowdinId, key, ns })
		qerror++
		return
	}
	output.push({ crowdinId, key, ns })
}
let recordTotal = 0
const run = async () => {
	const records = await prisma.translationKey.findMany({
		where: { crowdinId: null },
		select: { key: true, ns: true },
	})
	recordTotal = records.length
	for (const record of records) {
		const { key, ns } = record
		queue.add(async () => await task(key, ns))
	}
}

const startQueue = () => {
	queue.start()
}

const tasks = new Listr([
	{
		title: 'Adding Jobs',
		task: async (_, task) => {
			queue.on('add', () => {
				task.title = `Adding Jobs [${++qtotal}/${recordTotal}]`
			})
			await run()
		},
		rendererOptions: { bottomBar: 20 },
	},
	{
		title: 'Running Jobs',
		task: (_, task) => {
			const start = Date.now()
			const getRemainingTime = () => {
				// Get elapsed time
				const elapsed = Date.now() - start
				const averageTxn = elapsed / qcount
				const estimatedRemainder = queue.size * averageTxn

				return ms(estimatedRemainder)
			}
			queue.on('active', () => {
				task.title = `Running Jobs [${++qcount}/${qtotal}] Remaining: ${
					queue.size
				}. Errors: ${qerror}. Estimated remaining time: ${getRemainingTime()}.`
			})

			startQueue()
		},
		rendererOptions: { bottomBar: 20 },
	},
])
tasks.run()
