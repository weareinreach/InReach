import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'

import { UserSurveyModalLauncher } from './UserSurvey'

export default {
	title: 'Modals/User Survey',
	component: UserSurveyModalLauncher,
	parameters: { layout: 'fullscreen', layoutWrapper: 'centeredHalf' },
	args: {
		component: Button,
		children: 'Open User Survey Modal',
		variant: 'inlineInvertedUtil1',
	},
} satisfies Meta<typeof UserSurveyModalLauncher>

export const Modal = {}
