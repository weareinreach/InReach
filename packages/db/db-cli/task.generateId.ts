import inquirer from 'inquirer'
import autocomplete from 'inquirer-autocomplete-prompt'

import { generateId, idPrefix } from '~db/lib/idGen'

const filterKeys = (input) => {
	const regex = new RegExp(`.*${input}.*`, 'i')
	const matches: string[] = []

	for (const str of Object.keys(idPrefix).sort()) {
		const match = str.match(regex)
		if (match) {
			matches.push(...match)
		}
	}

	return matches
}

export const generateIdTask = () => {
	inquirer.registerPrompt('autocomplete', autocomplete)
	inquirer
		.prompt([
			{
				type: 'autocomplete',
				name: 'table',
				message: 'Select a table to generate an ID for:',
				source: (_answers: unknown, input: string) => filterKeys(input ?? ''),
			},
			{
				type: 'number',
				name: 'quantity',
				message: 'How many IDs do you want to generate?',
				default: 1,
			},
		])
		.then((answers) => {
			let output: string | string[] = ''
			if (answers.quantity === 1) {
				output = generateId(answers.table)
			} else {
				output = []
				for (let i = 1; i <= answers.quantity; i++) {
					output.push(generateId(answers.table))
				}
			}
			console.dir(output, { maxArrayLength: null })
		})
}
