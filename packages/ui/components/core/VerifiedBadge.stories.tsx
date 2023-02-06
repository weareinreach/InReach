import { Center } from '@mantine/core'
import { Meta, StoryFn } from '@storybook/react'
import React from 'react'

import { VerifiedBadge as VerifiedBadgeComp } from './VerifiedBadge'

export default {
	title: 'Design System/Tags and Badges/Verified Badge',
	component: VerifiedBadgeComp,

	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=234%3A8516&t=sleVeGl2lJv7Df18-4',
		},
	},
} as Meta<typeof VerifiedBadgeComp>

export const VerifiedBadge = {
	args: {
		lastVerifiedDate: new Date(),
	},
}
