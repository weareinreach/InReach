import i18next from 'i18next'
import intervalPlural from 'i18next-intervalplural-postprocessor'
import { initReactI18next } from 'react-i18next'

import attribute from '../../../apps/app/public/locales/en/attribute.json'
import common from '../../../apps/app/public/locales/en/common.json'
import services from '../../../apps/app/public/locales/en/services.json'

/**
 * A real, synchronously-initialized i18next instance for component tests - loads the actual English `common`,
 * `services`, and `attribute` namespaces so pluralization/interval behavior, and cross-namespace
 * `$t(services:...)` nesting (e.g. ServiceFilter's "All {{serviceCategory}}" label), are verified against
 * real content, not a mocked `t()` echo.
 */
export const testI18n = i18next.createInstance()

void testI18n
	.use(intervalPlural)
	.use(initReactI18next)
	.init({
		lng: 'en',
		fallbackLng: 'en',
		defaultNS: 'common',
		ns: ['common', 'services', 'attribute'],
		resources: { en: { common, services, attribute } },
		// Matches apps/app/next-i18next.config.mjs's real config: `skipOnVariables: false` is
		// required for nested `$t(...)` refs delivered via an interpolated variable (e.g.
		// ServiceFilter's "all-service-category" label) to resolve - i18next's own default
		// (`skipOnVariables: true`) skips that resolution as an injection safeguard.
		interpolation: { escapeValue: false, skipOnVariables: false, alwaysFormat: true },
		react: { useSuspense: false },
	})
