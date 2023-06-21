import { type Namespace } from 'i18next'
// eslint-disable-next-line no-restricted-imports
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import i18nextConfig from '../../next-i18next.config.mjs'

// type ArrayElementOrSelf<T> = T extends Array<infer U> ? U[] : T[]

type NamespaceSSR = string | string[] | undefined
export const getServerSideTranslations = async (
	locale = 'en',
	namespacesRequired?: Namespace,
	extraLocales?: string[] | false
) => serverSideTranslations(locale, namespacesRequired as NamespaceSSR, i18nextConfig, extraLocales)

export { i18nextConfig }
