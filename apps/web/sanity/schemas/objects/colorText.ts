import { defineType } from 'sanity'

export const colorText = defineType({
	name: 'ColorText',
	title: 'Text with special color',
	type: 'object',
	fields: [
		{
			name: 'text',
			title: 'Text',
			type: 'string',
		},
		// {
		// 	name: 'style',
		// 	title: 'Text Style',
		// 	type: 'string',
		// 	options: {
		// 		list: [
		// 			{title: 'Inherit from surrounding', value: 'inherit'},
		// 			{title: 'H2', value: 'h2'},
		// 			{title: 'H3', value: 'h3'},
		// 			{title: 'H4', value: 'h4'},
		// 		],
		// 	},
		// },
		{ name: 'color', title: 'Color', type: 'color' },
	],
	preview: {
		select: {
			title: 'text',
		},
	},
})
