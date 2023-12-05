import inquirer from 'inquirer'

import { generateUniqueSlug } from '~db/lib/slugGen'

export const generateSlugTask = () => {
	inquirer
		.prompt([
			{
				type: 'input',
				name: 'orgName',
				message: 'Enter the organization name:',
			},
		])
		.then(async (answers) => {
			const newSlug = await generateUniqueSlug({ name: answers.orgName, id: '' })
			console.log(newSlug)
		})
}
