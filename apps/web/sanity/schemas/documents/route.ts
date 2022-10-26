import {LinkIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const route = defineType({
	name: 'route',
	type: 'document',
	title: 'Route',
	icon: LinkIcon,
	fields: [
		defineField({
			name: 'slug',
			type: 'slug',
			title: 'Slug',
		}),
		defineField({
			name: 'page',
			type: 'reference',
			description: 'Select the page that this route should point to',
			to: [
				{
					type: 'page',
				},
			],
		}),
		defineField({
			name: 'includeInSitemap',
			type: 'boolean',
			title: 'Include page in sitemap',
			description: 'For search engines. Will be added to /sitemap.xml',
		}),
		defineField({
			name: 'disallowRobots',
			type: 'boolean',
			title: 'Disallow in robots.txt',
			description: 'Hide this route for search engines',
		}),
	],
	preview: {
		select: {
			slug: 'slug.current',
			pageTitle: 'page.title',
		},
		prepare({slug, pageTitle}) {
			return {
				title: slug === '/' ? '/' : `/${slug}`,
				subtitle: `Page: ${pageTitle}`,
			}
		},
	},
})
