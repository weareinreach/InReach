import { defineField, defineType } from 'sanity'

export const post = defineType({
	name: 'post',
	title: 'Blog Post',
	type: 'document',
	initialValue: {
		__i18n_lang: 'en-US',
	},
	i18n: true,
	fields: [
		defineField({
			name: 'metadata',
			type: 'metadata',
		}),
		defineField({
			name: 'mainImage',
			title: 'Main image',
			type: 'image',
			options: {
				hotspot: true,
			},
		}),
		defineField({
			name: 'body',
			title: 'Body',
			type: 'blockContent',
		}),
	],

	preview: {
		select: {
			title: 'metadata.title',
			author: 'author.name',
			media: 'mainImage',
		},
		prepare(selection: Record<string, string>) {
			const { author } = selection
			return { ...selection, subtitle: author && `by ${author}` }
		},
	},
})
