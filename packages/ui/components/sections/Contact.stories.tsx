import { Meta, StoryObj } from '@storybook/react'

import { StorybookGrid } from '~ui/layouts'
import { contactMock } from '~ui/mockData/contactSection'

import { ContactSection } from './Contact'

export default {
	title: 'Sections/Contact Info',
	component: ContactSection,
	args: {
		data: contactMock,
		role: 'org',
	},
	parameters: {
		layout: 'fullscreen',
		nextjs: {
			router: {
				pathname: '/org/[slug]',
				asPath: '/org/mockOrg',
				query: {
					slug: 'mockOrg',
				},
			},
		},
	},
	decorators: [StorybookGrid],
} satisfies Meta<typeof ContactSection>

type StoryDef = StoryObj<typeof ContactSection>
export const Desktop = {} satisfies StoryDef

export const Mobile = {
	parameters: {
		viewport: {
			defaultViewport: 'iphonex',
		},
	},
} satisfies StoryDef
