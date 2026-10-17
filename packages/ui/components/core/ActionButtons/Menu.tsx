import { Menu, type MenuProps, useMantineTheme } from '@mantine/core'
import {
	Children,
	cloneElement,
	forwardRef,
	isValidElement,
	type ReactElement,
	type RefObject,
	useMemo,
} from 'react'

import { Button } from '~ui/components/core/Button'
import { Icon } from '~ui/icon'
import { cx } from '~ui/lib/cx'

import { type ActionButtonElementProps } from './Group'
import classes from './styles.module.css'

// `pointer-events: none` (applied where this is used as a ref) only blocks mouse interaction with
// the decorative clone - its real nested button/anchor is still a native focusable element, so a
// keyboard user tabbing past the Menu.Item itself and onto that nested element could still activate
// it directly (Enter/Space on a real `<button>` doesn't go through pointer-events at all), retriggering
// the exact duplicate-live-instance bug this file's `onClick` proxy exists to avoid - just via keyboard
// instead of a click. Strips every nested focusable descendant out of tab order so the Menu.Item is
// the only way to reach this action from either input method.
const suppressNestedFocus = (node: HTMLElement | null) => {
	node?.querySelectorAll<HTMLElement>('button, a, [tabindex]').forEach((el) => {
		el.setAttribute('tabindex', '-1')
	})
}

const getTargetId = (e: ReactElement<ActionButtonElementProps>) => {
	const targetId = typeof e.props['data-targetid'] === 'string' && e.props['data-targetid']
	if (!targetId) {
		return null
	}
	return targetId
}

export const OverflowMenu = forwardRef<HTMLButtonElement, ActionButtonMenuProps>(
	({ children, className, visibilityMap, itemRefs, ...props }, ref) => {
		const theme = useMantineTheme()

		const shouldShowMenu = useMemo(
			() => Object.values(visibilityMap).some((v) => v === false),
			[visibilityMap]
		)

		if (!shouldShowMenu) {
			return null
		}
		const { inOverflowMenu: _inOverflowMenu, ...menuClassNames } = classes
		return (
			<Menu position='bottom-start' zIndex={200} classNames={menuClassNames} {...props}>
				<Menu.Target>
					<Button ref={ref} className={cx(classes.button, className)}>
						<Icon
							icon='carbon:overflow-menu-horizontal'
							color={theme.other.colors.secondary.black}
							className={classes.icon}
							height={24}
							width={24}
						/>
					</Button>
				</Menu.Target>
				<Menu.Dropdown>
					{Children.map(children, (child) => {
						const targetId = getTargetId(child as ReactElement<ActionButtonElementProps>)
						if (isValidElement<ActionButtonElementProps>(child) && targetId && !visibilityMap[targetId]) {
							const clonedElement = cloneElement(child, {
								className: cx(child.props.className, classes.inOverflowMenu, classes.item),
							})

							return (
								<Menu.Item
									component='div'
									key={targetId}
									// `ActionButtonGroup` already keeps a real, fully-interactive instance of every
									// action mounted (just visually hidden via `.inVisible`, see Group.module.css)
									// for width measurement - clicking that ALREADY-EXISTING instance here, rather
									// than rendering a second live copy of it (with its own Modal/Drawer, its own
									// `useSession`/query hooks) as this Menu.Item's own interactive children, is
									// what a `.click()` on a bare DOM element does regardless of CSS visibility.
									// This used to nest a real interactive trigger (Review/Report/Save's own
									// button, opening its own Modal) directly inside this Menu.Item - an
									// interactive element inside another - which raced Mantine's Menu closing
									// against the just-opened Modal's focus trap and left it completely
									// unresponsive (the same root cause documented on
									// `ContactInfo/PhoneNumbers.tsx`'s equivalent fix). The clone below is now
									// purely decorative (`pointer-events: none`) so a click always reaches this
									// Menu.Item instead of the nested button, and this handler proxies it to the
									// real, already-mounted instance instead. Not `aria-hidden` - this clone's
									// icon/text is this Menu.Item's only accessible label content, unlike
									// PhoneNumbers.tsx's equivalent fix where the hidden trigger is genuinely
									// separate from the item's own (already-labeled) visible children.
									onClick={() => itemRefs.current[targetId]?.querySelector<HTMLElement>('button, a')?.click()}
								>
									<div ref={suppressNestedFocus} style={{ pointerEvents: 'none' }}>
										{clonedElement}
									</div>
								</Menu.Item>
							)
						}

						return null
					})}
				</Menu.Dropdown>
			</Menu>
		)
	}
)
OverflowMenu.displayName = 'ActionButtons.Menu'

export interface ActionButtonMenuProps extends MenuProps {
	className: string
	visibilityMap: Record<string, boolean>
	itemRefs: RefObject<Record<string, HTMLElement | null>>
}
