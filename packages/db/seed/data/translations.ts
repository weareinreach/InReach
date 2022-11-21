import slugify from 'slugify'

export const namespaces = {
	user: 'user',
	country: 'country',
} as const

export const keySlug = (item: string) => slugify(item, { lower: true, strict: true })
