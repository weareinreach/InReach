import slugify from 'slugify'

export const namespaces = {
	user: 'user',
	country: 'country',
	nav: 'nav',
	footer: 'footer',
	socialMedia: 'socialMedia',
	services: 'services',
	govDist: 'gov-dist',
} as const

export const keySlug = (item: string) => slugify(item, { lower: true, strict: true })
