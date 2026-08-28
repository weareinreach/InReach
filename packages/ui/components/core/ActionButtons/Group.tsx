import { Box } from '@mantine/core'
import {
	Children,
	type ReactElement,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react'

import classes from './Group.module.css'
import { OverflowMenu } from './Menu'

const MENU_WIDTH = 50
const GAP = 8
/** Fallback used only for the first paint, before a button has ever been measured. */
const FALLBACK_BUTTON_WIDTH = 90

export const ActionButtonGroup = ({ children }: ActionButtonGroupProps) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const [containerWidth, setContainerWidth] = useState(0)

	// Buttons vary in actual width (icon + "Review" vs icon + "Save"/"Saved", per-locale text
	// length, etc.) - a single guessed width for all of them (the old `BUTTON_WIDTH = 90`
	// constant) drifts from reality by a different amount per button, so the fit/no-fit decision
	// was inconsistent (e.g. showing fewer buttons at a wider container than at a narrower one).
	// Every button stays mounted regardless of computed visibility (`.inVisible` is
	// `position: absolute` + `visibility: hidden`, not `display: none`), so its true rendered
	// width is always measurable here - `widthsRef` accumulates those real measurements and
	// `widthsVersion` re-triggers the fit calculation once they change.
	const widthsRef = useRef<Record<string, number>>({})
	const itemRefs = useRef<Record<string, HTMLElement | null>>({})
	const [widthsVersion, setWidthsVersion] = useState(0)

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

	useLayoutEffect(() => {
		let changed = false
		for (const [id, el] of Object.entries(itemRefs.current)) {
			if (!el) continue
			const width = el.getBoundingClientRect().width
			if (width && widthsRef.current[id] !== width) {
				widthsRef.current[id] = width
				changed = true
			}
		}
		if (changed) setWidthsVersion((version) => version + 1)
	})

	const setItemRef = useCallback(
		(id: string) => (el: HTMLElement | null) => {
			itemRefs.current[id] = el
		},
		[]
	)

	const visibilityMap = useMemo(() => {
		const childrenArray = Children.toArray(children) as ReactElement<ActionButtonElementProps>[]
		const map: Record<string, boolean> = {}

		// Before the ResizeObserver's first callback fires, `containerWidth` is still 0, which would
		// make `availableSpace` negative and mark every single button (including Save/Report)
		// invisible - a real, if brief, window where the whole toolbar is unclickable on first
		// paint. Show everything until there's an actual measurement to compute against.
		if (containerWidth === 0) {
			childrenArray.forEach((child) => {
				const id = child.props['data-targetid']
				if (id) {
					map[id] = true
				}
			})
			return map
		}

		// How many buttons fit in the current width? Reserve space for the overflow menu icon.
		let availableSpace = containerWidth - MENU_WIDTH

		childrenArray.forEach((child) => {
			const id = child.props['data-targetid']
			if (id) {
				const width = widthsRef.current[id] ?? FALLBACK_BUTTON_WIDTH
				const needed = width + GAP
				if (availableSpace >= needed) {
					map[id] = true
					availableSpace -= needed
				} else {
					map[id] = false
				}
			}
		})
		return map
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [children, containerWidth, widthsVersion])

	return (
		<Box ref={containerRef} className={classes.groupWrapper}>
			{Children.map(children, (child) => {
				const reactChild = child as ReactElement<ActionButtonElementProps>
				const targetId = reactChild.props['data-targetid']
				if (!targetId) return child

				const isVisible = visibilityMap[targetId] ?? true

				return (
					<Box
						key={targetId}
						ref={setItemRef(targetId)}
						className={isVisible ? classes.visible : classes.inVisible}
					>
						{reactChild}
					</Box>
				)
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
