import { Title, List, Stack, Center } from '@mantine/core'
import { Meta, StoryObj } from '@storybook/react'

import { GenericContentModal, type GenericContentModalProps } from './GenericContent'
import { Button, Link } from '../components/core'

export default {
	title: 'Modals/Generic Content',
	component: GenericContentModal,
	parameters: { layout: 'fullscreen', layoutWrapper: 'centeredHalf' },
} satisfies Meta<typeof GenericContentModal>

type StoryDef = StoryObj<typeof GenericContentModal>

export const CustomContent = {
	args: {
		content: 'custom',
		customBody: (
			<Stack>
				<Title order={2}>Custom Content</Title>
				<List>
					<List.Item>List</List.Item>
					<List.Item>of</List.Item>
					<List.Item>things.</List.Item>
				</List>
			</Stack>
		),
		children: 'Custom Launcher',
		component: Button,
	},
} satisfies StoryDef

export const Disclaimer = {
	args: {
		content: 'disclaimer',
		children: 'Disclaimer',
		component: Link,
		variant: 'inlineInvertedUtil1',
	},
} satisfies StoryDef

export const AntiHateGeneral = {
	args: {
		content: 'antiHate',
		children: 'Anti-hate commitment',
		component: Link,
		variant: 'inlineInvertedUtil1',
	},
} satisfies StoryDef
export const AntiHateAccept = {
	args: {
		content: 'antiHate',
		children: 'Anti-hate commitment',
		component: Link,
		variant: 'inlineInvertedUtil1',
		accept: true,
	},
} satisfies StoryDef
export const AccessibilityStatement = {
	args: {
		content: 'accessibilityStatement',
		children: 'Accessibility Statement',
		component: Link,
		variant: 'inlineInvertedUtil1',
	},
}
