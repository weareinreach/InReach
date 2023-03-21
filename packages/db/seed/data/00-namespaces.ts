import { slug } from '~db/.'

export const namespaces = {
	attribute: 'attribute',
	common: 'common',
	country: 'country',
	govDist: 'gov-dist',
	phoneType: 'phone-type',
	services: 'services',
	socialMedia: 'common',
	user: 'user',
	orgData: 'org-data',
} as const

/**
 * Value for TranslationNamespace.exportFile. Defaults to: `true`
 *
 * Only needed when json generation should be suppressed.
 */
export const namespaceGen = {
	'org-data': false,
}

export const keySlug = (item: string) => slug(item)
