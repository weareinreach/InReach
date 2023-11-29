import inquirer from 'inquirer'

import { generateIdTask } from './task.generateId'
import { generateSlugTask } from './task.generateSlug'

const main = () =>
	inquirer
		.prompt([
			{
				type: 'list',
				name: 'task',
				message: 'Select a task/tool',
				choices: [
					{ name: 'Generate IDs', value: 'generateId' },
					{ name: 'Generate Slug', value: 'generateSlug' },
					// { name: 'Quit', value: 'quit' },
				],
			},
		])
		.then((answers) => {
			if (!answers.task) throw new Error('Something went wrong.')
			if (answers.task === 'quit') process.exit()
			switch (answers.task) {
				case 'generateId': {
					return generateIdTask()
				}
				case 'generateSlug': {
					return generateSlugTask()
				}
			}
		})

main()
