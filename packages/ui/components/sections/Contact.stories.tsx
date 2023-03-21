import { Meta, StoryObj } from '@storybook/react'

import { StorybookGridSingle } from '~ui/layouts'
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
	decorators: [StorybookGridSingle],
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
