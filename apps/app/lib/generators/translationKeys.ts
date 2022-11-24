import dotenv from 'dotenv'
import fs from 'fs'
import { ListrTask } from 'lib/generate'

import { prisma } from '@weareinreach/db'

dotenv.config()

export const generateTranslationKeys = async (task: ListrTask) => {
	const data = await prisma.translationNamespace.findMany({
		include: {
			keys: {
				orderBy: {
					key: 'asc',
				},
			},
		},
	})
	let logMessage = ''
	let i = 0
	for (const namespace of data) {
		const output: Record<string, string> = {}
		for (const item of namespace.keys) {
			output[item.key] = item.text
		}
		logMessage = `${namespace.name}.json generated with ${Object.keys(output).length} items`
		fs.writeFileSync(`_generated/${namespace.name}.json`, JSON.stringify(output, null, 2))
		task.output = logMessage
		i++
	}
	task.title = `Exporting translation definitions from DB [${i} file(s)]`
}
