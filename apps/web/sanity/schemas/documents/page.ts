import { MasterDetailIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const page = defineType({
	name: 'page',
	type: 'document',
	title: 'Page',
	initialValue: {
		__i18n_lang: 'en-US',
	},
	i18n: true,
	icon: MasterDetailIcon,
	fieldsets: [
		{
			title: 'SEO & metadata',
			name: 'metadata',
		},
	],
	fields: [
		defineField({
			name: 'content',
			type: 'array',
			title: 'Page sections',
			of: [
				defineArrayMember({ type: 'blockContent' }),
				defineArrayMember({
					name: 'HeroCarousel',
					// title: "Hero (Carousel version)",
					type: 'HeroCarousel',
				}),
			],
		}),
		defineField({
			name: 'metadata',
			type: 'metadata',
		}),
	],
	preview: {
		select: {
			title: 'metadata.title',
			subtitle: 'metadata.slug',
			media: 'metadata.seo.openGraphImage',
		},
	},
})
