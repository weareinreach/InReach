import { Center } from '@mantine/core'
import { Meta } from '@storybook/react'

import { Button, Link } from '~ui/components/core'

import { PrivacyStatementModal } from './PrivacyStatement'

export default {
	title: 'Modals/Privacy Statement',
	component: PrivacyStatementModal,
	parameters: { layout: 'fullscreen', layoutWrapper: 'centeredHalf' },
	args: {
		component: Link,
		children: 'Open Privacy Statement',
		variant: 'inlineInvertedUtil1',
	},
} satisfies Meta<typeof PrivacyStatementModal>

export const Modal = {}
