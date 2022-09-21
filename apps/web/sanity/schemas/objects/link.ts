// import React from 'react'
import {defineField, defineType} from 'sanity'

// const LinkRender = ({children}: React.PropsWithChildren): JSX.Element => {
// 	return <div>{children}</div>
// }

export const internalLink = defineType({
	name: 'internalLink',
	title: 'Link to URL',
	type: 'object',
	fields: [
		defineField({
			name: 'external',
			type: 'url',
			title: 'URL',
			hidden: ({parent, value}) => !value && parent?.internal,
		}),
		defineField({
			name: 'internal',
			type: 'reference',
			to: [
				{type: 'page'}, // edit these to match collections
				// {type: 'article'},
				// {type: 'homePage'},
			],
			hidden: ({parent, value}) => !value && parent?.external,
		}),
	],
})

export const link = defineType({
	title: 'URL',
	name: 'link',
	type: 'object',
	fields: [
		{
			title: 'URL',
			name: 'href',
			type: 'url',
			validation: (Rule) =>
				Rule.uri({
					allowRelative: true,
					scheme: ['https', 'http', 'mailto', 'tel'],
				}),
		},
	],
})
