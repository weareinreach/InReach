import dotenv from 'dotenv'
import fs from 'fs'
import { ListrTask } from 'lib/generate'

import { prisma } from '@weareinreach/db'

const localePath = 'public/locales/en'

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
		const outputData: Record<string, string> = {}
		for (const item of namespace.keys) {
			outputData[item.key] = item.text
		}
		const filename = `${localePath}/${namespace.name}.json`
		let existingFile: Record<string, string> = {}
		if (fs.existsSync(filename)) {
			existingFile = JSON.parse(fs.readFileSync(filename, 'utf-8'))
		}
		const existingLength = Object.keys(existingFile).length

		let outputFile = Object.assign(existingFile, outputData)
		outputFile = Object.keys(outputFile)
			.sort()
			.reduce((obj: Record<string, string>, key) => {
				obj[key] = outputFile[key] as string
				return obj
			}, {})

		const newKeys = Object.keys(outputFile).length - existingLength

		logMessage = `${filename} generated with ${newKeys} new ${newKeys === 1 ? 'key' : 'keys'}.`

		fs.writeFileSync(filename, JSON.stringify(outputFile, null, 2))
		task.output = logMessage
		i++
	}
	task.title = `Exporting translation definitions from DB [${i} file(s)]`
}
