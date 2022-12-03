import dotenv from 'dotenv'
import fs from 'fs'
import mb from 'mongoback'
import path from 'path'
import { InputData, jsonInputForTargetLanguage, quicktype } from 'quicktype-core'
import recursive from 'recursive-readdir'

dotenv.config()

const options: mb.Options = {
	// eslint-disable-next-line turbo/no-undeclared-env-vars
	uri: process.env.MONGO_URI,
	/** Relative to where `package.json` is */
	outDir: './data-transfer/output',
	collections: ['comments', 'organizations', 'ratings', 'reviews', 'suggestions', 'users'],
	verbose: true,
	type: 'json',
	jsonArray: true,
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
		`./data-transfer/output-types${file.substring(file.lastIndexOf('/')).replace('.json', '.ts')}`
	)
	const fileHeader = `/* eslint-disable @typescript-eslint/no-explicit-any */
	/* eslint-disable @typescript-eslint/no-unused-vars */\n`

	fs.writeFileSync(outPath, `${fileHeader}\n${output.lines.join('\n')}`)
}
const generateTypes = async () => {
	/** Relative to where `package.json` is */
	const files = (await recursive('./data-transfer/output')).filter((file) => path.extname(file) === '.json')
	console.log(`Files to process:\n- ${files.join('\n- ')}`)

	for (const file of files) {
		console.log(`Generating types for: ${file}`)
		await quicktypeJSON(`${path.basename(file)}Collection`, file)
	}
}

const run = async () => {
	await mb.mongoExport(options)
	await generateTypes()
}

run()
