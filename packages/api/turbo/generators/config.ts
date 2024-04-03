import { type PlopTypes } from '@turbo/gen'
//@ts-expect-error types aren't loading...?
import searchList from 'inquirer-search-list'

import fs from 'fs'
import path from 'path'

const getRouters = () => {
	const dirContents = fs.readdirSync(path.resolve(__dirname, '../../router'), { withFileTypes: true })
	const routers = dirContents.filter((d) => d.isDirectory()).map((d) => d.name)
	return routers
}
export default function generator(plop: PlopTypes.NodePlopAPI): void {
	plop.setPrompt('searchList', searchList)
	// create a generator
	plop.setGenerator('trpc-handler', {
		description: 'tRPC API Handler',
		prompts: [
			{
				type: 'searchList',
				// @ts-expect-error This is fine...
				choices: getRouters(),
				message: 'Choose a router',
				name: 'routerDir',
				validate: (val) => {
					const choices = getRouters()
					return choices.includes(val)
				},
			},
			{
				type: 'input',
				name: 'name',
				message: 'API Handler method name',
				validate: (val) => {
					const regex = /^[a-z]+$/i
					return regex.test(val)
				},
			},
			{
				type: 'list',
				name: 'operation',
				message: 'API Handler operation',
				choices: [
					{ name: 'Query', value: 'query', key: 'q' },
					{ name: 'Mutation', value: 'mutation', key: 'm' },
				],
			},
			{
				type: 'confirm',
				name: 'createSchema',
				message: 'Does this handler require an input schema?',
				default: true,
			},
		],
		actions: (data) => {
			if (!data) throw new Error('No data')
			data.isMutation = data.operation === 'mutation'
			const basePath = "router/{{routerDir}}/{{operation}}.{{name}}"
			const actions: PlopTypes.Actions = []

			actions.push({
				type: 'add',
				path: `${basePath}.handler.ts`,
				templateFile: 'templates/handlers/handler.ts.hbs',
			})
			if (data.createSchema) {
				actions.push({
					type: 'add',
					path: `${basePath}.schema.ts`,
					templateFile: 'templates/handlers/schema.ts.hbs',
				})
			}
			return actions
		},
	})
}
