import fs from 'fs'
import path from 'path'

import { prisma } from '@weareinreach/db'
import { crowdinApi } from '~api/crowdin/client'

interface KeyData {
	key: string
	crowdinId: number
	slug: string
}

interface TestData {
	id: number
	key: string
}

const run = async () => {
	const data = await prisma.translationKey.findMany({
		where: { ns: 'org-data' },
		select: { key: true, crowdinId: true },
	})

	const batchSize = 100
	const totalBatches = Math.ceil(data.length / batchSize)
	let batchCount = 1
	while (data.length) {
		const batch = data.splice(0, batchSize)

		console.log(`[${batchCount}/${totalBatches}] Processing ${batch.length} items.`)

		const result = await crowdinApi.sourceStringsApi.stringBatchOperations(
			12,
			batch.map(({ key, crowdinId }) => ({
				op: 'replace',
				path: `/${crowdinId}/identifier`,
				value: key,
			}))
		)
		// const result = { data: batch }
		console.log(`\tResult count: ${result.data.length}`)
		batchCount++
	}

	// const updates = await crowdinApi.sourceStringsApi.stringBatchOperations(
	// 	12,
	// 	data.map(({ key, crowdinId, slug }) => ({
	// 		op: 'replace',
	// 		path: `/${crowdinId}/context`,
	// 		value: `https://app.inreach.org/org/${slug}`,
	// 	}))
	// )
	// console.log(updates)
}

run()

const test = async () => {
	// const out: Record<string, string> = {}
	// for (let i = 0; i < 5000; i++) {
	// 	out[`key-${i.toString().padStart(4, '0')}`] = `Text item ${i.toString().padStart(4, '0')}`
	// }
	const data: unknown[] = []
	for (let i = 0; i < 10; i++) {
		console.log(`Batch ${i + 1}`)
		const result = await crowdinApi.sourceStringsApi.listProjectStrings(14, {
			fileId: 3141,
			limit: 500,
			offset: 500 * i,
		})
		data.push(...result.data.map(({ data }) => ({ id: data.id, key: data.identifier })))
	}
	fs.writeFileSync('data.json', JSON.stringify(data))
}
// test()
