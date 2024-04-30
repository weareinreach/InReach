/* eslint-disable node/no-process-env */
import dotenv from 'dotenv'
import { flatten, unflatten } from 'flat'
import prettier from 'prettier'

import fs from 'fs'

import { prisma, type Prisma } from '@weareinreach/db/client'
import { type PassedTask } from 'lib/generate'

const localePath = 'public/locales/en'

dotenv.config()

type Output = Record<string, string | Record<string, string>>

const isOutput = (data: unknown): data is Output => typeof data === 'object'

const isObject = (data: unknown): data is Record<string, string> =>
	typeof data === 'object' && !Array.isArray(data)

const countKeys = (obj: Output): number => Object.keys(flatten(obj)).length

const where = (): Prisma.TranslationNamespaceWhereInput | undefined => {
	switch (true) {
		case !!process.env.EXPORT_ALL: {
			return undefined
		}
		case !!process.env.EXPORT_DB: {
			return {
				name: 'org-data',
			}
		}
		default: {
			return { exportFile: true }
		}
	}
}

const getKeysFromDb = async () =>
	await prisma.translationNamespace.findMany({
		where: where(),
		include: {
			keys: {
				...(!process.env.EXPORT_INACTIVE && { where: { active: true } }),
				orderBy: {
					key: 'asc',
				},
			},
		},
		orderBy: {
			name: 'asc',
		},
	})

type DBKeys = Prisma.PromiseReturnType<typeof getKeysFromDb>[number]['keys']

const processKeys = (keys: DBKeys) => {
	const outputData: Output = {}
	for (const item of keys) {
		if (item.interpolation && isObject(item.interpolationValues)) {
			for (const [context, textContent] of Object.entries(item.interpolationValues)) {
				if (typeof textContent !== 'string') {
					throw new Error('Invalid nested plural item')
				}
				outputData[`${item.key}_${context}`] = textContent
			}
		}
		if (!item.interpolation || item.interpolation === 'CONTEXT') {
			outputData[item.key] = item.text
		}
	}
	return outputData
}

export const generateTranslationKeys = async (task: PassedTask) => {
	const prettierConfig = (await prettier.resolveConfig(__filename, { editorconfig: true })) ?? undefined
	const prettierOpts = prettierConfig ? { ...prettierConfig, parser: 'json' } : undefined
	const data = await getKeysFromDb()
	let logMessage = ''
	let i = 0
	task.output = `Fetched ${data.length} namespaces from DB`
	for (const namespace of data) {
		const outputData = processKeys(namespace.keys)
		const filename = `${localePath}/${namespace.name}.json`

		let existingFile: unknown = {}
		if (fs.existsSync(filename) && !namespace.overwriteFileOnExport) {
			existingFile = flatten(JSON.parse(fs.readFileSync(filename, 'utf-8')))
		}
		if (!isOutput(existingFile)) {
			throw new Error("tried to load file, but it's empty")
		}

		const existingLength = countKeys(existingFile)
		let outputFile: Output = unflatten(Object.assign(existingFile, outputData), { overwrite: true })
		outputFile = Object.keys(outputFile)
			.toSorted((a, b) => a.localeCompare(b))
			.reduce((obj: Record<string, string>, key) => {
				obj[key] = outputFile[key] as string
				return obj
			}, {})

		const newKeys = countKeys(outputFile) - existingLength
		logMessage = `${filename} generated with ${newKeys} ${namespace.overwriteFileOnExport ? 'total' : 'new'} ${newKeys === 1 ? 'key' : 'keys'}.`
		const formattedOutput = await prettier.format(JSON.stringify(outputFile), prettierOpts)
		fs.writeFileSync(filename, formattedOutput, 'utf-8')
		task.output = logMessage
		i++
	}
	task.title = `Exporting translation definitions from DB [${i} file(s)]`
}
