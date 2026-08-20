import { Box, Button, Center, Stack } from '@mantine/core'
import { type Meta } from '@storybook/nextjs'

import { useShake, type UseShakeProps } from './useShake'

const DemoComponent = ({ variant }: UseShakeProps) => {
	const { animateStyle, fireEvent, shakeRef } = useShake({ variant })

	return (
		<Center>
			<Stack gap={100} w={400} align='center'>
				<Box h={300} w={300} style={{ backgroundColor: 'blue', ...animateStyle }} ref={shakeRef} />
				<Button onClick={fireEvent}>Animate!</Button>
			</Stack>
		</Center>
	)
}

export default {
	title: 'Hooks/useShake',
	component: DemoComponent,
	args: {
		variant: 1,
	},
} satisfies Meta<typeof DemoComponent>

export const Default = {}
