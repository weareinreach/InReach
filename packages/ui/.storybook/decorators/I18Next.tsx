import { type StoryContext, type StoryFn } from '@storybook/react'
import { type GlobalTypes } from '@storybook/types'
import { useEffect, useState } from 'react'
import { I18nextProvider } from 'react-i18next'

import { translatedLangs } from '@weareinreach/db/generated/languages'

import { i18n } from '../i18next'

export const WithI18n = (Story: StoryFn, context: StoryContext) => {
	const { globals, parameters } = context
	const [locale, setLocale] = useState(globals.locale ?? 'en')

	useEffect(() => {
		if (parameters?.i18n && globals?.locale && globals.locale !== locale) {
			setLocale(globals.locale)
			parameters.i18n.changeLanguage(globals.locale)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [globals?.locale])

	return (
		<I18nextProvider i18n={i18n}>
			<Story />
		</I18nextProvider>
	)
}

export const i18NextGlobalTypes: GlobalTypes = {
	locale: {
		name: 'Locale',
		description: 'Internationalization locale',
		defaultValue: 'en',
		toolbar: {
			icon: 'globe',
			items: translatedLangs.map((lang) => ({ value: lang.localeCode, title: lang.languageName })),
		},
	},
}
