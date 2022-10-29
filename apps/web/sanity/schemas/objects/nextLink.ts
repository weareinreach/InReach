// import React from 'react'
import { defineField, defineType } from 'sanity'

// const LinkRender = ({children}: React.PropsWithChildren): JSX.Element => {
// 	return <div>{children}</div>
// }

export const nextLink = defineType({
	name: 'NextLink',
	title: 'Link to:',
	type: 'object',
	fields: [
		defineField({
			name: 'internal',
			type: 'reference',
			to: [{ type: 'page' }],
			hidden: ({ parent, value }) => !value && !!parent?.external,
		}),
		defineField({
			name: 'external',
			type: 'url',
			title: 'URL',
			hidden: ({ parent, value }) => !value && !!parent?.internal,
		}),
	],
})

// export const link = defineType({
// 	title: 'URL',
// 	name: 'link',
// 	type: 'object',
// 	fields: [
// 		{
// 			title: 'URL',
// 			name: 'href',
// 			type: 'url',
// 			validation: (Rule) =>
// 				Rule.uri({
// 					allowRelative: true,
// 					scheme: ['https', 'http', 'mailto', 'tel'],
// 				}),
// 		},
// 	],
// })
