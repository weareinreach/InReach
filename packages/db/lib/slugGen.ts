import slugify from 'slugify'

export const slug = (string: string) => slugify(string, { lower: true, strict: true })
