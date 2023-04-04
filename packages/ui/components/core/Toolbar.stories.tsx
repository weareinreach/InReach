import { Center } from '@mantine/core'
import { action } from '@storybook/addon-actions'
import { Meta, StoryObj } from '@storybook/react'

import { getTRPCMock } from '~ui/lib/getTrpcMock'

import { Toolbar } from './Toolbar'

export default {
	title: 'Design System/Toolbar',
	component: Toolbar,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=309%3A5895',
		},
		nextjs: {
			router: {
				pathname: '/org/[slug]',
				asPath: '/org/mockOrg',
				query: {
					slug: 'mockOrg',
				},
			},
		},
		msw: {
			handlers: [
				getTRPCMock({
					path: ['organization', 'getIdFromSlug'],
					type: 'query',
					response: {
						id: 'orgn_ORGANIZATIONID',
					},
				}),
				getTRPCMock({
					path: ['review', 'create'],
					type: 'mutation',
					response: {
						id: 'orev_NEWREVIEWID',
					},
				}),
			],
		},
		layout: 'fullscreen',
	},
	args: {
		breadcrumbProps: {
			option: 'back',
			backTo: 'search',
			onClick: () => action('onClick')(''),
		},
	},
	render: (args) => (
		<Center style={{ maxWidth: '861px', width: '100%', height: '100vh', margin: '0 auto' }}>
			<Toolbar {...args} />
		</Center>
	),
} satisfies Meta<typeof Toolbar>

type StoryDef = StoryObj<typeof Toolbar>

export const NotSaved = {
	args: { saved: false },
} satisfies StoryDef

export const Saved = {
	args: { saved: true },
} satisfies StoryDef

export const SmallVersion = {
	parameters: {
		viewport: {
			defaultViewport: 'iphone6',
		},
	},
}
