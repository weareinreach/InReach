import {defineType, defineField} from 'sanity'

export const heroCarousel = defineType({
	name: 'HeroCarousel',
	title: 'Hero (Carousel Version)',
	type: 'object',
	fields: [
		{
			name: 'HeroCarousel',
			title: 'Slides',
			type: 'array',
			of: [
				defineField({
					name: 'slides',
					title: 'Carousel Slides',
					type: 'object',
					fields: [
						{
							name: 'image',
							title: 'Background Image',
							type: 'image',
						},
						{
							name: 'text',
							title: 'Overlay text',
							type: 'array',
							of: [
								{
									type: 'block',
									styles: [],
									lists: [],
									marks: {
										decorators: [
											{title: 'Strong', value: 'strong'},
											{title: 'Emphasis', value: 'em'},
										],
										annotations: [
											/* It's a comment. */
										],
									},
									of: [{type: 'CtaButton'}, {type: 'ColorText'}],
								},
							],
						},
					],
				}),
			],
		},
	],
})
