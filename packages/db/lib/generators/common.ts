import prettier from 'prettier'

import { writeFileSync } from 'fs'
import path from 'path'

/**
 * It takes a filename and some data, and writes it to a file in the `generated` directory
 *
 * @param {string} filename - The base name of the file to write to, **without extension**.
 * @param {string} data - The data to be written to the file.
 */
export const writeOutput = async (filename: string, data: string, isJs = false) => {
	const prettierOpts = (await prettier.resolveConfig(__dirname)) ?? undefined
	const parser = isJs ? 'babel' : 'typescript'
	const outFile = `${path.resolve(__dirname, '../../generated')}/${filename}.${isJs ? 'mjs' : 'ts'}`

	const formattedOutput = prettier.format(data, { ...prettierOpts, parser })
	writeFileSync(outFile, formattedOutput)
}
