import slugify from 'slugify'

type SlugifyOptions = Parameters<typeof slugify>['1']

export const slug = (string: string, options: SlugifyOptions = { lower: true, strict: true, trim: true }) =>
	slugify(string, options)
