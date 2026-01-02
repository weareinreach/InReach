import { Flex, Text, UnstyledButton } from '@mantine/core'
import { action } from '@storybook/addon-actions'
import { type Meta, type StoryObj } from '@storybook/react'

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

type Story = StoryObj<typeof MobileLangPicker>

export const MobileLanguagePicker: Story = {
	render: () => (
		<MobileLangPicker>
			<a href='#' style={{ width: '100%', textDecoration: 'none', color: 'inherit', display: 'block' }}>
				<Flex justify='space-between' align='center' py={14}>
					<Text>Choose a Language</Text>
				</Flex>
			</a>
		</MobileLangPicker>
	),
}
