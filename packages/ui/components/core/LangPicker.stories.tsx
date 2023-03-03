import { action } from '@storybook/addon-actions'
import { Meta } from '@storybook/react'

import { LangPicker } from './LangPicker'

export default {
	title: 'Sections/Navbar/Language Picker',
	component: LangPicker,
	parameters: {
		nextjs: {
			router: {
				push(url, as, options) {
					const args = { url, as, options }
					action('nextRouter.push')(args)
					action('locale switch')(options?.locale)
					return Promise.resolve(true)
				},
			},
		},
	},
} satisfies Meta<typeof LangPicker>

export const LanguagePicker = {}
