import { prisma } from '@weareinreach/db'
import dotenv from 'dotenv'
import { unflatten } from 'flat'
import { ListrTask } from 'lib/generate'

import fs from 'fs'

const localePath = 'public/locales/en'

dotenv.config()

type Output = Record<string, string | Record<string, string>>

const isOutput = (data: unknown): data is Output => {
	return typeof data === 'object'
}

const countKeys = (obj: Output): number =>
	Object.keys(obj).reduce((acc, curr) => {
		if (typeof obj[curr] === 'object') return acc + countKeys(obj[curr] as Output)
		else return ++acc
	}, 0)

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
		const outputData: Output = {}
		for (const item of namespace.keys) {
			outputData[item.key] = item.text
		}
		const filename = `${localePath}/${namespace.name}.json`
		// eslint-disable-next-line prefer-const
		let existingFile = {}
		if (fs.existsSync(filename)) {
			existingFile = JSON.parse(fs.readFileSync(filename, 'utf-8'))
			if (!isOutput(existingFile)) throw new Error("tried to load file, but it's empty")
		}
		// const existingLength = Object.keys(existingFile).length
		const existingLength = countKeys(existingFile)

		let outputFile: Output = unflatten(Object.assign(existingFile, outputData), { overwrite: true })
		outputFile = Object.keys(outputFile)
			.sort()
			.reduce((obj: Record<string, string>, key) => {
				obj[key] = outputFile[key] as string
				return obj
			}, {})

		const newKeys = countKeys(outputFile) - existingLength

		logMessage = `${filename} generated with ${newKeys} new ${newKeys === 1 ? 'key' : 'keys'}.`

		fs.writeFileSync(filename, JSON.stringify(outputFile, null, 2))
		task.output = logMessage
		i++
	}
	task.title = `Exporting translation definitions from DB [${i} file(s)]`
}
