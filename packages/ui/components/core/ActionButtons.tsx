import { Button, createStyles, Menu, Text, useMantineTheme } from '@mantine/core'
import { useSetState } from '@mantine/hooks'
import { background } from '@storybook/theming'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import { Icon } from '../../icon'

export const actionButtonIcons = {
	delete: { icon: 'carbon:delete', labelKey: 'delete' },
	more: {
		icon: 'carbon:overflow-menu-horizontal',
		useMenu: true,
		menuItems: ['Save', 'Share', 'Print', 'Review', 'Delete'],
	},
	print: { icon: 'carbon:printer', labelKey: 'print' },
	review: { icon: 'carbon:star', labelKey: 'review' },
	save: {
		icon: 'carbon:favorite',
		labelKey: 'save',
		useMenu: true,
		menuItems: ['Create new list', 'List 1', 'List 2'],
	},
	share: { icon: 'carbon:share', labelKey: 'share' },
} as const

const useStyles = createStyles((theme) => ({
	button: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		minWidth: '48px',
		height: '48px',
		padding: '12px',
		gap: '8px',
		backgroundColor: theme.other.colors.secondary.white,
		'&:hover': {
			backgroundColor: theme.other.colors.primary.lightGray,
		},
	},
	buttonPressed: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		minWidth: '48px',
		height: '48px',
		padding: '12px',
		gap: '8px',
		backgroundColor: theme.other.colors.primary.lightGray,
		'&:hover': {
			backgroundColor: theme.other.colors.primary.lightGray,
		},
	},
	icon: {
		marginLeft: '5.5px',
	},
	text: {
		fontWeight: theme.other.fontWeight.semibold,
		marginLeft: '9.25px',
	},
	menu: {
		background: 'black',
		'&:button': {
			color: 'white',
		},
	},
}))

const actions = {
	delete: () => {
		console.log('delete')
	},
	more: () => {
		console.log('more')
	},
	print: () => {
		window.print()
	},
	review: () => {
		console.log('review')
	},
	save: () => {
		console.log('save')
	},
	share: () => {
		console.log('share')
	},
} as const

/** Used to display the action buttons when viewing an organization/location/service. */
export const ActionButtons = ({ iconKey, overflowItems }: Props) => {
	const { classes } = useStyles()
	const theme = useMantineTheme()
	const { t } = useTranslation()
	const iconRender = actionButtonIcons[iconKey]
	const handler = actions[iconKey]
	const menuThings = 'menuItems' in iconRender ? iconRender.menuItems : []
	const [opened, setOpened] = useState(false)

	/** The button component */
	const buttonComponent = (
		<Button className={opened ? classes.buttonPressed : classes.button} radius='md' onClick={handler}>
			<Icon
				icon={iconRender.icon}
				color={theme.other.colors.secondary.black}
				className={'labelKey' in iconRender ? '' : classes.icon}
			/>
			{'labelKey' in iconRender && <Text className={classes.text}>{t(iconRender.labelKey)}</Text>}
		</Button>
	)

	/** The menu component */
	const menuComponent = (
		<Menu position='bottom-start' opened={opened} onChange={setOpened}>
			<Menu.Target>{buttonComponent}</Menu.Target>
			<Menu.Dropdown style={{ background: 'black' }}>
				{menuThings &&
					menuThings.map((option, index) => (
						<Menu.Item key={index} value={index} color='white'>
							{option}
						</Menu.Item>
					))}
			</Menu.Dropdown>
		</Menu>
	)

	return <>{'useMenu' in iconRender ? <>{menuComponent}</> : <>{buttonComponent}</>}</>
}

type Props = {
	/**
	 * The action button is created using an iconKey, which, depending on the value supplied, will display
	 * either an icon and a label or just an icon
	 */
	iconKey: keyof typeof actionButtonIcons
	overflowItems?: Array<Exclude<keyof typeof actionButtonIcons, 'more' | undefined>>
}
