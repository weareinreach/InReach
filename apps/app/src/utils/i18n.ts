import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import i18nextConfig from '../../next-i18next.config.mjs'

export const getServerSideTranslations = async (locale: string, ns: string[]) =>
	await serverSideTranslations(locale, ns, i18nextConfig)

export { i18nextConfig }
