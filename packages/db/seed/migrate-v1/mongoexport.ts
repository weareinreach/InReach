/* eslint-disable import/no-unused-modules */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { type Options as mbOptions, mongoExport } from 'mongoback'
import { InputData, jsonInputForTargetLanguage, quicktype } from 'quicktype-core'
import recursive from 'recursive-readdir'
import { env } from '@weareinreach/config/env'

import fs from 'fs'
import path from 'path'

const datastore = './datastore/v1/mongodb'

const options: mbOptions = {
	// eslint-disable-next-line turbo/no-undeclared-env-vars
	uri: env.MONGO_URI,
	/** Relative to where `package.json` is */
	outDir: `${datastore}/output`,
	collections: ['comments', 'organizations', 'ratings', 'reviews', 'suggestions', 'users'],
	verbose: true,
	type: 'json',
	jsonArray: true,
	pretty: true,
	outType: 'flat',
	prependDbName: false,
}
async function quicktypeJSON(typeName: string, file: string) {
	const jsonInput = jsonInputForTargetLanguage('typescript')

	const jsonFile = JSON.parse(fs.readFileSync(file, 'utf-8'))
	const jsonString = JSON.stringify(jsonFile)
	// We could add multiple samples for the same desired
	// type, or many sources for other types. Here we're
	// just making one type from one piece of sample JSON.
	await jsonInput.addSource({
		name: typeName,
		samples: [jsonString],
	})

	const inputData = new InputData()
	inputData.addInput(jsonInput)

	const output = await quicktype({
		inputData,
		lang: 'ts',
	})
	/** Relative to where `package.json` is */
	const outPath = path.resolve(
		`${datastore}/output-types${file.substring(file.lastIndexOf('/')).replace('.json', '.ts')}`
	)
	const fileHeader = `/* eslint-disable @typescript-eslint/no-explicit-any */
	/* eslint-disable @typescript-eslint/no-unused-vars */\n`

	fs.writeFileSync(outPath, `${fileHeader}\n${output.lines.join('\n')}`)
}
const generateTypes = async () => {
	/** Relative to where `package.json` is */
	const files = (await recursive(`${datastore}/output`)).filter((file) => path.extname(file) === '.json')
	console.log(`Files to process:\n- ${files.join('\n- ')}`)

	for (const file of files) {
		console.log(`Generating types for: ${file}`)
		await quicktypeJSON(`${path.basename(file)}Collection`, file)
	}
}

const run = async () => {
	await mongoExport(options)
	await generateTypes()
}

run()
