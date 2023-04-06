import { createStyles } from '@mantine/core'
import { useEventListener, useTimeout } from '@mantine/hooks'
import { useState } from 'react'

import { shake } from '~ui/theme/animation'

const useStyles = createStyles((theme, { variant }: UseShakeProps) => ({
	animate: {
		animation: `${shake[variant]} 0.1s ease-in-out 0s 2`,
	},
}))

export const useShake = ({ variant }: UseShakeProps) => {
	const { classes } = useStyles({ variant })
	const [active, setActive] = useState(false)
	const animateCSS = active ? classes.animate : undefined
	const { start, clear } = useTimeout(() => setActive(false), 2000)
	const ref = useEventListener('animationend', () => {
		setActive(false)
		clear()
	})

	const fireEvent = () => {
		setActive(true)
		start()
	}

	return { shakeRef: ref, animateCSS, fireEvent }
}

export interface UseShakeProps {
	variant: keyof typeof shake
}
