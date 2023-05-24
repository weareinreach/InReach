import { type Meta, type StoryObj } from '@storybook/react'

import { Breadcrumb as BreadcrumbCompnent } from './Breadcrumb'

export default {
	title: 'Design System/Breadcrumb',
	component: BreadcrumbCompnent,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=297%3A6037&t=sleVeGl2lJv7Df18-4',
		},
	},
} satisfies Meta<typeof BreadcrumbCompnent>

type StoryDef = StoryObj<typeof BreadcrumbCompnent>
export const Close = {
	args: {
		option: 'close',
	},
} satisfies StoryDef
export const Back = {
	args: {
		option: 'back',
		backTo: 'none',
	},
} satisfies StoryDef
export const BackToSearch = {
	args: {
		option: 'back',
		backTo: 'search',
	},
} satisfies StoryDef
export const BackToDynamic = {
	args: {
		option: 'back',
		backTo: 'dynamicText',
		backToText: 'Sample Organization Name',
	},
	parameters: {
		nextjs: {
			router: {
				pathname: '/org/[slug]/[orgLocationId]',
				asPath: '/org/sample-organization-name/oloc_000000S4MPL3',
				query: {
					slug: 'sample-organization-name',
					orgLocationId: 'oloc_000000S4MPL3',
				},
			},
		},
	},
} satisfies StoryDef
export const BackToDynamicWithSpecialCharacters = {
	args: {
		option: 'back',
		backTo: 'dynamicText',
		backToText: "Sample Organization Name with special characters' % - *",
	},
	parameters: {
		nextjs: {
			router: {
				pathname: '/org/[slug]/[orgLocationId]/edit',
				asPath: '/org/sample-organization-name/oloc_000000S4MPL3/edit',
				query: {
					slug: 'sample-organization-name',
					orgLocationId: 'oloc_000000S4MPL3',
				},
			},
		},
	},
} satisfies StoryDef
