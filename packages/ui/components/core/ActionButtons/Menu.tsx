import { Box, Menu, type MenuProps, useMantineTheme } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Children, forwardRef } from 'react'

import { Icon } from '~ui/icon'

import { useStyles } from './styles'

export const OverflowMenu = forwardRef<HTMLButtonElement, ActionButtonMenuProps>(
	({ children, ...props }, ref) => {
		const { classes } = useStyles()
		const theme = useMantineTheme()
		const [menuOpen, menuHandler] = useDisclosure(false)

		return (
			<Menu
				position='bottom-start'
				opened={menuOpen}
				onChange={menuHandler.toggle}
				zIndex={200}
				classNames={classes}
				keepMounted
			>
				<Box component={Menu.Target} ref={ref} className={classes.item} {...props}>
					<Icon
						icon='carbon:overflow-menu-horizontal'
						color={theme.other.colors.secondary.black}
						className={classes.icon}
						height={24}
						width={24}
					/>
				</Box>
				<Menu.Dropdown>
					{Children.map(children, (child) => (
						<Menu.Item>{child}</Menu.Item>
					))}
				</Menu.Dropdown>
			</Menu>
		)
	}
)
OverflowMenu.displayName = 'ActionButtons.Menu'

export interface ActionButtonMenuProps extends MenuProps {}
