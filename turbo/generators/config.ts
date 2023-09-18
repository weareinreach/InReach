import { type PlopTypes } from '@turbo/gen'

export default function generator(plop: PlopTypes.NodePlopAPI): void {
	plop.setGenerator('new-package', {
		description: 'New Package',
		prompts: [
			{
				type: 'list',
				choices: ['app', 'package'],
				name: 'type',
				message: 'Is this an app or shared package?',
			},
			{ type: 'input', name: 'name', message: 'Package name (without scope)' },
		],
		actions: [
			{
				type: 'addMany',
				destination: '{{type}}s/{{name}}',
				templateFiles: 'templates/package/*.hbs',
				skipIfExists: true,
				base: 'templates/package',
				globOptions: {
					dot: true,
				},
			},
		],
	})
}
