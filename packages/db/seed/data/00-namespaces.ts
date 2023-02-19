import { slug } from '~db/.'

export const namespaces = {
	attribute: 'attribute',
	common: 'common',
	country: 'country',
	footer: 'common',
	govDist: 'gov-dist',
	nav: 'common',
	orgDescription: 'org-description',
	orgService: 'org-service',
	phoneType: 'phone-type',
	services: 'services',
	socialMedia: 'common',
	user: 'user',
} as const

/**
 * Value for TranslationNamespace.exportFile. Defaults to: `true`
 *
 * Only needed when json generation should be suppressed.
 */
export const namespaceGen = {}

export const keySlug = (item: string) => slug(item)
