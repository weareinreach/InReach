import { Box, createStyles } from '@mantine/core'
import { Children, cloneElement, type ReactElement, useCallback, useEffect, useRef, useState } from 'react'

import { OverflowMenu } from './Menu'

const useStyles = createStyles(() => ({
	visible: {
		order: 0,
		visibility: 'visible',
		opacity: 1,
	},
	inVisible: {
		order: 100,
		visibility: 'hidden',
		pointerEvents: 'none',
	},
	groupWrapper: {
		display: 'flex',
		overflow: 'hidden',
		flexWrap: 'nowrap',
		maxWidth: '100%',
	},
	overflowStyle: {
		order: 99,
		position: 'sticky',
		right: 0,
	},
}))

const isHTMLElement = (e: unknown): e is HTMLElement => e instanceof HTMLElement

const getTargetId = (e: ReactElement) => {
	const targetId = typeof e.props['data-targetid'] === 'string' && e.props['data-targetid']
	if (!targetId) {
		return null
	}
	return targetId
}

export const ActionButtonGroup = ({ children }: ActionButtonGroupProps) => {
	const { classes, cx } = useStyles()
	const containerRef = useRef<HTMLDivElement>(null)
	const [visibilityMap, setVisibilityMap] = useState<Record<string, boolean>>({})
	const handleIntersection: IntersectionObserverCallbackFn = useCallback((entries) => {
		const updatedEntries: Record<string, boolean> = {}
		entries.forEach((entry) => {
			if (isHTMLElement(entry.target)) {
				const targetid = entry.target.dataset.targetid
				if (!targetid) {
					return
				}
				if (entry.isIntersecting) {
					updatedEntries[targetid] = true
				} else {
					updatedEntries[targetid] = false
				}
			}
		})

		setVisibilityMap((prev) => ({
			...prev,
			...updatedEntries,
		}))
	}, [])
	useEffect(() => {
		const observer = new IntersectionObserver(handleIntersection, {
			root: containerRef.current,
			threshold: 1,
		})

		// We are addting observers to child elements of the container div
		// with ref as navRef. Notice that we are adding observers
		// only if we have the data attribute observerid on the child elemeent
		containerRef.current &&
			Array.from(containerRef.current.children).forEach((item) => {
				if (isHTMLElement(item) && item.dataset.targetid) {
					observer.observe(item)
				}
			})
		return () => observer.disconnect()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<Box ref={containerRef} className={classes.groupWrapper}>
			{...Children.map(children, (child) => {
				const targetId = getTargetId(child)
				if (!targetId) {
					return child
				}
				const isVisible = visibilityMap[targetId] ?? false
				const clonedChild = cloneElement(child, {
					...child.props,
					className: cx(child.props.className, {
						[classes.visible]: isVisible,
						[classes.inVisible]: !isVisible,
					}),
				})
				return clonedChild
			})}
			<OverflowMenu visibilityMap={visibilityMap} className={classes.overflowStyle}>
				{children}
			</OverflowMenu>
		</Box>
	)
}

interface ActionButtonGroupProps {
	children: ReactElement | ReactElement[]
}

type IntersectionObserverCallbackFn = ConstructorParameters<typeof IntersectionObserver>[0]
