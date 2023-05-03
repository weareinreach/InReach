import { type Namespace } from 'i18next'
// eslint-disable-next-line no-restricted-imports
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import i18nextConfig from '../../next-i18next.config.mjs'

type ArrayElementOrSelf<T> = T extends Array<infer U> ? U[] : T[]

export const getServerSideTranslations = async (
	locale = 'en',
	namespacesRequired?: ArrayElementOrSelf<Namespace> | undefined,
	extraLocales?: string[] | false
) => serverSideTranslations(locale, namespacesRequired, i18nextConfig, extraLocales)

export { i18nextConfig }
