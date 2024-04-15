/* eslint-disable no-restricted-imports */
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { type LiteralUnion } from 'type-fest'

import { type Namespaces } from '@weareinreach/db/generated/namespaces'

import i18nextConfig from '../../next-i18next.config.mjs'

type Namespace = LiteralUnion<Namespaces, string>

const defaultNamespace = (
	typeof i18nextConfig.defaultNS === 'string' ? i18nextConfig.defaultNS : 'common'
) satisfies Namespace

export const getServerSideTranslations = async (
	locale = 'en',
	namespacesRequired: Namespace | Namespace[] = defaultNamespace,
	extraLocales?: string[] | false
) => {
	const namespaceSet = new Set(
		...(Array.isArray(namespacesRequired) ? namespacesRequired : [namespacesRequired])
	)
	namespaceSet.add('common')

	const namespacesToLoad = Array.from(namespaceSet)

	return serverSideTranslations(locale, namespacesToLoad, i18nextConfig, extraLocales)
}

export { i18nextConfig }
