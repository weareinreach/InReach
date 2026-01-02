import { action } from '@storybook/addon-actions'
import { type Meta } from '@storybook/react'

import { MobileLangPicker } from './MobileLangPicker'

export default {
	title: 'Sections/Navbar/MobileLanguage Picker',
	component: MobileLangPicker,
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
} satisfies Meta<typeof MobileLangPicker>

export const MobileLanguagePicker = {}
