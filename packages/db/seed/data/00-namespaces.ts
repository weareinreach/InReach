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
	phoneType: 'phone-type',
	services: 'services',
	socialMedia: 'socialMedia',
	user: 'user',
} as const

/**
 * Value for TranslationNamespace.exportFile. Defaults to: `true`
 *
 * Only needed when json generation should be suppressed.
 */
export const namespaceGen = {
	orgDescription: false,
	nav: false,
	footer: false,
}

export const keySlug = (item: string) => slugify(item, { lower: true, strict: true })
