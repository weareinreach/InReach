import slugify from 'slugify'

export const namespaces = {
	attribute: 'attribute',
	common: 'common',
	country: 'country',
	footer: 'footer',
	govDist: 'gov-dist',
	nav: 'nav',
	orgDescription: 'org-description',
	orgService: 'org-service',
	services: 'services',
	socialMedia: 'socialMedia',
	user: 'user',
} as const

export const keySlug = (item: string) => slugify(item, { lower: true, strict: true })
