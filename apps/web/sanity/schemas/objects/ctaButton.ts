import {defineType} from 'sanity'
import {CtaButton} from '@inreach/ui/components/web'

export const ctaButton = defineType({
	title: 'Call to action',
	name: 'CtaButton',
	type: 'object',
	validation: (Rule) =>
		Rule.custom((fields = {}) => !fields.route || !fields.link || 'Only one link type is allowed'),
	fieldsets: [
		{
			title: 'Link',
			name: 'link',
		},
	],
	fields: [
		{
			title: 'Button Text',
			name: 'title',
			type: 'string',
		},
		{
			title: 'Internal link',
			description: 'Use this to link between pages on the website',
			name: 'route',
			type: 'reference',
			to: [{type: 'route'}],
			fieldset: 'link',
			hidden: ({parent, value}) => !value && parent?.link,
		},
		{
			title: 'External link',
			name: 'link',
			type: 'url',
			fieldset: 'link',
			hidden: ({parent, value}) => !value && parent?.route,
		},
	],
	// components: {
	// 	field: CtaButton,
	// },
	// preview: {
	// 	select: {
	// 		title: 'title',
	// 		routeTitle: 'route.title',
	// 		slug: 'route.slug.current',
	// 		link: 'link',
	// 	},
	// 	prepare({title, routeTitle = '', slug, link}) {
	// 		console.log(title)
	// 		const subtitleExtra = slug ? `Slug:/${slug}/` : link ? `External link: ${link}` : 'Not set'
	// 		return {
	// 			title: `${title}`,
	// 			subtitle: `${routeTitle} ${subtitleExtra}`,
	// 		}
	// 	},
	// },
})
