import { Button, createStyles, Menu, Text, useMantineTheme } from '@mantine/core'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import { Icon } from '~ui/icon'

export const actionButtonIcons = {
	save: {
		icon: 'carbon:favorite',
		labelKey: 'save',
		useMenu: true,
	},
	saved: {
		icon: 'carbon:favorite-filled',
		labelKey: 'saved',
	},
	share: { icon: 'carbon:share', labelKey: 'share' },
	print: { icon: 'carbon:printer', labelKey: 'print' },
	review: { icon: 'carbon:star', labelKey: 'review' },
	delete: { icon: 'carbon:delete', labelKey: 'delete' },
	more: {
		icon: 'carbon:overflow-menu-horizontal',
		useMenu: true,
	},
} as const

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
	saved: () => {
		console.log('unsave')
	},
	share: () => {
		console.log('share')
	},
	saveNew: () => {
		console.log('create new list')
	},
	saveToList: () => {
		console.log('save to existing list')
	},
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
	dropdown: {
		background: 'black',
	},
	item: {
		color: 'white',
		'&[data-hovered]': {
			backgroundColor: 'white',
			color: 'black',
		},
	},
}))

/** Used to display the action buttons when viewing an organization/location/service. */
export const ActionButtons = ({ iconKey }: Props) => {
	const { classes } = useStyles()
	const theme = useMantineTheme()
	const { t } = useTranslation()
	const iconRender = actionButtonIcons[iconKey]
	const handler = actions[iconKey]
	const { more: _, ...overFlowItems } = actionButtonIcons
	const saveItems = ['List 1', 'List 2'] /* this will be the users lists */

	const [opened, setOpened] = useState(false)

	const overflowMenuItems = Object.entries(overFlowItems).map(([key, item]) => (
		<Menu.Item key={key} value={key} icon={<Icon icon={item.icon} />} onClick={actions[item.labelKey]}>
			{t(item.labelKey)}
		</Menu.Item>
	))

	const createNewList = (
		<Menu.Item key='new' value='new' onClick={actions['saveNew']}>
			{t('create-new-list')}
		</Menu.Item>
	)
	const saveMenuItems = saveItems.map((key) => (
		<Menu.Item key={key} value={key} onClick={actions['saveToList']}>
			{key}
		</Menu.Item>
	))

	const menuThings =
		iconKey === 'save' ? (
			<>
				{createNewList}
				{saveMenuItems}
			</>
		) : (
			overflowMenuItems
		)

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
		<Menu position='bottom-start' opened={opened} onChange={setOpened} classNames={classes}>
			<Menu.Target>{buttonComponent}</Menu.Target>
			<Menu.Dropdown>{menuThings}</Menu.Dropdown>
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
}
