/* eslint-disable no-restricted-imports */
import { type DefaultNamespace } from 'i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { type LiteralUnion } from 'type-fest'

import { type Namespaces } from '@weareinreach/db/generated/namespaces'

import i18nextConfig from '../../next-i18next.config.mjs'

// type ArrayElementOrSelf<T> = T extends Array<infer U> ? U[] : T[]

type Namespace = LiteralUnion<Namespaces, string>
type NamespaceSSR = string | string[] | undefined
export const getServerSideTranslations = async (
	locale = 'en',
	namespacesRequired: Namespace | Namespace[] = i18nextConfig.defaultNS as DefaultNamespace,
	extraLocales?: string[] | false
) => serverSideTranslations(locale, namespacesRequired as NamespaceSSR, i18nextConfig, extraLocales)

export { i18nextConfig }
