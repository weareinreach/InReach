import {defineField} from 'sanity'

export const simplePortableText = defineField({
	title: 'Simple Portable Text',
	name: 'simplePortableText',
	type: 'array',
	of: [
		{
			title: 'Block',
			type: 'block',
			styles: [],
			lists: [],
			marks: {
				decorators: [
					{title: 'Strong', value: 'strong'},
					{title: 'Emphasis', value: 'em'},
					{title: 'Code', value: 'code'},
				],
				annotations: [
					/* It's a comment. */
					{type: 'link'},
					{type: 'internalLink'},
				],
			},
		},
	],
})
