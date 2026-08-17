import { type Meta } from '@storybook/nextjs'
import { useEffect, useState } from 'react'
import { action } from 'storybook/actions'

import { StorybookGridDouble } from '~ui/layouts/BodyGrid'
import { attribute } from '~ui/mockData/attribute'

import { MoreFilter, type MoreFilterProps } from './MoreFilter'

const MoreFilterWrapper = (args: MoreFilterProps) => {
	const [filter, _setFilter] = useState<string[]>([])
	useEffect(() => {
		action('Set service filter')(filter)
	}, [filter])
	// @ts-expect-error I don't know why - but I'm over it.
	return <MoreFilter {...args} />
}

export default {
	title: 'Modals/More Filter',
	component: MoreFilterWrapper,

	beforeEach({ msw }) {
		msw.use(attribute.getFilterOptions)
	},

	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=51%3A493&t=OR50OY3K2rzSJbrl-0',
		},

		layout: 'fullscreen',
	},

	// render: function Render(args) {
	// 	const [filter, _setFilter] = useState<string[]>([])
	// 	useEffect(() => {
	// 		action('Set service filter')(filter)
	// 	}, [filter])
	// 	return <MoreFilter {...args} />
	// },
	decorators: [StorybookGridDouble],
} satisfies Meta<typeof MoreFilterWrapper>

export const MoreFilterExample = {}
