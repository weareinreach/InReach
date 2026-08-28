import { Menu, type MenuProps, useMantineTheme } from '@mantine/core'
import { Children, cloneElement, forwardRef, isValidElement, type ReactElement, useMemo } from 'react'

import { Button } from '~ui/components/core/Button'
import { Icon } from '~ui/icon'
import { cx } from '~ui/lib/cx'

import { type ActionButtonElementProps } from './Group'
import classes from './styles.module.css'

const getTargetId = (e: ReactElement<ActionButtonElementProps>) => {
	const targetId = typeof e.props['data-targetid'] === 'string' && e.props['data-targetid']
	if (!targetId) {
		return null
	}
	return targetId
}

export const OverflowMenu = forwardRef<HTMLButtonElement, ActionButtonMenuProps>(
	({ children, className, visibilityMap, ...props }, ref) => {
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
			<Menu
				position='bottom-start'
				zIndex={200}
				classNames={menuClassNames}
				// Without this, Mantine closes (and unmounts) the dropdown the instant any item is
				// clicked - before that item's own click handler can run. Several of these cloned
				// items (Report, Save) open their own modal on a short delay after their click fires,
				// so the dropdown closing first unmounts them mid-click and the modal never actually
				// opens - "the button does nothing." The user dismisses this menu the normal way,
				// same as the column-visibility menu elsewhere already does.
				closeOnItemClick={false}
				{...props}
			>
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

							return <Menu.Item component='div'>{clonedElement}</Menu.Item>
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
}
