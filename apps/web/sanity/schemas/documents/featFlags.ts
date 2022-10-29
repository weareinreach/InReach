import { defineType } from 'sanity'

export const featFlags = defineType({
	name: 'featureFlags',
	type: 'document',
	title: 'Feature flags',
	fields: [
		{
			title: 'Feature flags',
			name: 'flags',
			description: 'Use feature flags to quickly enable or disable (new) features on production.',
			type: 'array',
			of: [
				{
					title: 'Feature',
					name: 'feature',
					type: 'object',
					fields: [
						{
							name: 'title',
							type: 'string',
							title: 'Title',
						},
						{
							name: 'key',
							type: 'string',
							title: 'The key used to turn off/on features in the front-end',
						},
						{
							name: 'description',
							type: 'text',
							title: 'Description',
							description: 'Description of the feature',
						},
						{
							name: 'status',
							type: 'boolean',
							description: 'Disable or enable the feature',
							title: 'Enabled / disabled?',
						},
					],
				},
			],
		},
	],
})
