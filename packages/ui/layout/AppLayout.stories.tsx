import { Meta, StoryFn } from '@storybook/react'
import React from 'react'

import { PageFooter } from 'components/layout/Footer.stories'
import { NavigationHeaderBar } from 'components/layout/Nav.stories'

import { AppLayout } from './AppLayout'

export default {
	title: 'App/Layout/MainAppLayout',
	component: AppLayout,
	args: {
		navItems: NavigationHeaderBar.args?.navItems,
		footerLinks: PageFooter.args?.links,
		socialMedia: PageFooter.args?.socialMedia,
	},
	parameters: {
		layout: 'fullscreen',
	},
} as Meta<typeof AppLayout>

export const MainAppLayout = {}
