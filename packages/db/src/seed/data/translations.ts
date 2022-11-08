import slugify from 'slugify'

export const namespaces = {
	user: 'user',
	common: 'common',
}

export const keySlug = (item: string) => slugify(item, { lower: true, strict: true })
