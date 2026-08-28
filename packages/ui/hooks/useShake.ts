import { useEventListener, useTimeout } from '@mantine/hooks'
import { type CSSProperties, useState } from 'react'

import { shake } from '~ui/theme/animation'

export const useShake = ({ variant }: UseShakeProps) => {
	const [active, setActive] = useState(false)
	const animateStyle: CSSProperties | undefined = active
		? { animation: `${shake[variant]} 0.1s ease-in-out 0s 2` }
		: undefined
	const { start, clear } = useTimeout(() => setActive(false), 2000)
	const ref = useEventListener('animationend', () => {
		setActive(false)
		clear()
	})

	const fireEvent = () => {
		setActive(true)
		start()
	}

	return { shakeRef: ref, animateStyle, fireEvent }
}

export interface UseShakeProps {
	variant: keyof typeof shake
}
