import i18next from 'i18next'
import intervalPlural from 'i18next-intervalplural-postprocessor'
import { initReactI18next } from 'react-i18next'

import common from '../../../apps/app/public/locales/en/common.json'

/**
 * A real, synchronously-initialized i18next instance for component tests - loads the actual English `common`
 * namespace so pluralization/interval behavior is verified against real content, not a mocked `t()` echo.
 */
export const testI18n = i18next.createInstance()

void testI18n
	.use(intervalPlural)
	.use(initReactI18next)
	.init({
		lng: 'en',
		fallbackLng: 'en',
		defaultNS: 'common',
		ns: ['common'],
		resources: { en: { common } },
		interpolation: { escapeValue: false },
		react: { useSuspense: false },
	})
