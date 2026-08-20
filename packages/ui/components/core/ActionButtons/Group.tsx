import { Box } from '@mantine/core'
import { Children, cloneElement, type ReactElement, useEffect, useMemo, useRef, useState } from 'react'

import classes from './Group.module.css'
import { OverflowMenu } from './Menu'

export const ActionButtonGroup = ({ children }: ActionButtonGroupProps) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const [containerWidth, setContainerWidth] = useState(0)

	// Approximate width of your buttons + gaps (adjust based on your actual button sizes)
	// Review (~80px), Share (~80px), Save (~80px), Report (~80px) + 3 gaps (~24px) + Menu (~40px)
	const BUTTON_WIDTH = 90
	const MENU_WIDTH = 50

	useEffect(() => {
		const container = containerRef.current
		if (!container) return

		const observer = new ResizeObserver((entries) => {
			// Standard guard clause for the first entry
			const entry = entries[0]
			if (!entry) return

			setContainerWidth(entry.contentRect.width)
		})

		observer.observe(container)
		return () => observer.disconnect()
	}, [])

	const visibilityMap = useMemo(() => {
		const childrenArray = Children.toArray(children)
		const map: Record<string, boolean> = {}

		// Logic: How many buttons fit in the current width?
		// We reserve space for the overflow menu icon
		let availableSpace = containerWidth - MENU_WIDTH

		childrenArray.forEach((child) => {
			const id = (child as ReactElement<ActionButtonElementProps>).props['data-targetid']
			if (id) {
				if (availableSpace > BUTTON_WIDTH) {
					map[id] = true
					availableSpace -= BUTTON_WIDTH
				} else {
					map[id] = false
				}
			}
		})
		return map
	}, [children, containerWidth])

	return (
		<Box ref={containerRef} className={classes.groupWrapper}>
			{Children.map(children, (child) => {
				const reactChild = child as ReactElement<ActionButtonElementProps>
				const targetId = reactChild.props['data-targetid']
				if (!targetId) return child

				const isVisible = visibilityMap[targetId] ?? true

				return cloneElement(reactChild, {
					className: [reactChild.props.className, isVisible ? classes.visible : classes.inVisible]
						.filter(Boolean)
						.join(' '),
				})
			})}

			<OverflowMenu visibilityMap={visibilityMap} className={classes.overflowStyle as string}>
				{children}
			</OverflowMenu>
		</Box>
	)
}

interface ActionButtonGroupProps {
	children: ReactElement | ReactElement[]
}

export interface ActionButtonElementProps {
	'data-targetid'?: string
	className?: string
}
