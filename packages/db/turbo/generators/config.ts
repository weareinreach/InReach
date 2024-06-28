import { type PlopTypes } from '@turbo/gen'
import { DateTime } from 'luxon'
import slugify from 'slugify'

export default function generator(plop: PlopTypes.NodePlopAPI): void {
	plop.setHelper('slug', (str: string) => slugify(str, { lower: true, strict: true, trim: true }))
	plop.setHelper('dateDashed', () => DateTime.now().toFormat('yyyy-MM-dd'))
	plop.setHelper('dateConcat', () => DateTime.now().toFormat('yyyyMMdd'))
	plop.setHelper('forVar', (str: string) =>
		slugify(str, { lower: true, strict: true, trim: true }).replaceAll('-', '_')
	)

	// create a generator
	plop.setGenerator('data-migration', {
		description: 'Data migration',
		prompts: [
			{
				type: 'input',
				name: 'shortDescription',
				message: 'Short description',
			},
			{
				type: 'input',
				name: 'name',
				message: 'Your name',
			},
			{
				type: 'confirm',
				name: 'createInFolder',
				message: 'Create the migration in a folder?',
				default: false,
			},
		],
		actions: (data) => {
			const filePath = data?.createInFolder
				? '{{dateDashed}}_{{slug shortDescription}}/index.ts'
				: '{{dateDashed}}_{{slug shortDescription}}.ts'

			return [
				{
					type: 'add',
					path: `prisma/data-migrations/${filePath}`,
					templateFile: 'templates/dataMigration.hbs',
				},
				{
					type: 'append',
					path: `prisma/data-migrations/index.ts`,
					pattern: /export \* from '[^']+';?(?=\n\/\/ codegen:end)/,
					template: `export * from './${filePath.replace('.ts', '')}'`,
				},
			]
		},
	})
}
