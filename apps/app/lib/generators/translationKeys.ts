import dotenv from 'dotenv'
import { unflatten, flatten } from 'flat'
import prettier from 'prettier'
import { prisma } from '@weareinreach/db'

import fs from 'fs'

import { ListrTask } from 'lib/generate'

const localePath = 'public/locales/en'

dotenv.config()

type Output = Record<string, string | Record<string, string>>

const isOutput = (data: unknown): data is Output => typeof data === 'object'

const isObject = (data: unknown): data is Record<string, string> =>
	typeof data === 'object' && !Array.isArray(data)

const countKeys = (obj: Output): number => Object.keys(flatten(obj)).length

export const generateTranslationKeys = async (task: ListrTask) => {
	const prettierOpts = (await prettier.resolveConfig(__dirname)) ?? undefined

	const data = await prisma.translationNamespace.findMany({
		where: {
			exportFile: true,
		},
		include: {
			keys: {
				orderBy: {
					key: 'asc',
				},
			},
		},
		orderBy: {
			name: 'asc',
		},
	})
	let logMessage = ''
	let i = 0
	task.output = `Fetched ${data.length} namespaces from DB`
	for (const namespace of data) {
		const outputData: Output = {}
		for (const item of namespace.keys) {
			if (item.interpolation && isObject(item.interpolationValues)) {
				for (const [key, value] of Object.entries(item.interpolationValues)) {
					if (typeof value !== 'string') throw new Error('Invalid nested plural item')
					outputData[`${item.key}_${key}`] = value
				}
			} else {
				outputData[item.key] = item.text
			}
		}
		const filename = `${localePath}/${namespace.name}.json`
		// eslint-disable-next-line prefer-const
		let existingFile: unknown = {}
		if (fs.existsSync(filename)) {
			existingFile = flatten(JSON.parse(fs.readFileSync(filename, 'utf-8')))
		}
		if (!isOutput(existingFile)) throw new Error("tried to load file, but it's empty")
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

		const formattedOutput = prettier.format(JSON.stringify(outputFile), {
			...prettierOpts,
			parser: 'json',
		})
		fs.writeFileSync(filename, formattedOutput)

		task.output = logMessage
		i++
	}
	task.title = `Exporting translation definitions from DB [${i} file(s)]`
}
