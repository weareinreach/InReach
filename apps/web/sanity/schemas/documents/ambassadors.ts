import { SocialMediaIconSelect } from '@weareinreach/ui/components/web'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const ambassador = defineType({
	name: 'ambassador',
	title: 'Ambassador',
	type: 'document',
	i18n: true,
	fields: [
		defineField({
			name: 'name',
			title: 'Name',
			type: 'string',
		}),
		defineField({
			name: 'image',
			title: 'Image',
			type: 'image',
			options: {
				hotspot: true,
			},
		}),
		defineField({
			name: 'location',
			title: 'Location',
			type: 'string',
		}),
		defineField({
			name: 'testimonial',
			title: 'Testimonial',
			type: 'array',
			of: [
				defineArrayMember({
					type: 'block',
					styles: [{ title: 'Normal', value: 'normal' }],
					lists: [],
				}),
			],
		}),
		defineField({
			name: 'shortBio',
			title: 'Short Bio Tagline',
			type: 'text',
			rows: 4,
		}),
		defineField({
			name: 'bio',
			title: 'Bio',
			type: 'array',
			of: [
				defineArrayMember({
					type: 'block',
					styles: [{ title: 'Normal', value: 'normal' }],
					lists: [],
				}),
			],
		}),
		defineField({
			title: 'Social Media Links',
			name: 'socialMediaLinks',
			type: 'array',
			of: [
				defineArrayMember({
					type: 'object',
					fields: [
						defineField({
							name: 'service',
							title: 'Service',
							type: 'string',
						}),
						{
							name: 'href',
							title: 'Profile Link',
							type: 'url',
							validation: (Rule) =>
								Rule.uri({
									allowRelative: true,
									scheme: ['https', 'http'],
								}),
						},

						defineField({
							name: 'icon',
							title: 'Icon',
							type: 'string',
							components: {
								input: SocialMediaIconSelect,
							},
						}),
					],
				}),
			],
		}),
	],
	preview: {
		select: {
			title: 'name',
			media: 'image',
		},
	},
})
