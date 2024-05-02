import { Menu, type MenuProps, useMantineTheme } from '@mantine/core'
import {
	Children,
	cloneElement,
	forwardRef,
	isValidElement,
	type MouseEventHandler,
	type ReactElement,
	useCallback,
	useMemo,
	useState,
} from 'react'

import { Button } from '~ui/components/core/Button'
import { Icon, type IconifyIconHTMLElement } from '~ui/icon'

import { useStyles } from './styles'

const getTargetId = (e: ReactElement) => {
	const targetId = typeof e.props['data-targetid'] === 'string' && e.props['data-targetid']
	if (!targetId) {
		return null
	}
	return targetId
}

export const OverflowMenu = forwardRef<HTMLButtonElement, ActionButtonMenuProps>(
	({ children, className, visibilityMap, ...props }, ref) => {
		const { classes, cx } = useStyles()
		const theme = useMantineTheme()
		const [anchorEl, setAnchorEl] = useState<
			(EventTarget & IconifyIconHTMLElement) | (EventTarget & HTMLElement) | null
		>(null)
		const open = Boolean(anchorEl)

		const handleClick: MouseEventHandler<IconifyIconHTMLElement> & MouseEventHandler<HTMLElement> =
			useCallback(
				(event) => {
					setAnchorEl(event.currentTarget)
				},
				[setAnchorEl]
			)

		const handleClose = useCallback(() => {
			setAnchorEl(null)
		}, [setAnchorEl])

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
				opened={open}
				onClose={handleClose}
				// onChange={menuHandler.toggle}
				zIndex={200}
				classNames={menuClassNames}
				keepMounted
				portalProps={{
					target: anchorEl ?? undefined,
				}}
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
							onClick={handleClick}
						/>
					</Button>
				</Menu.Target>
				<Menu.Dropdown>
					{Children.map(children, (child) => {
						const targetId = getTargetId(child as ReactElement)
						if (isValidElement<HTMLInputElement>(child) && targetId && !visibilityMap[targetId]) {
							const clonedElement = cloneElement(child, {
								className: cx(child.props.className, classes.inOverflowMenu, classes.item),
							})

							return (
								<Menu.Item component='div' onClick={handleClose}>
									{clonedElement}
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
}
