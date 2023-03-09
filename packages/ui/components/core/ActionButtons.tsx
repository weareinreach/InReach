import { Button, createStyles, Menu, Text, useMantineTheme, rem } from '@mantine/core'
import { DefaultTFuncReturn } from 'i18next'
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
// TODO: [IN-786] Associate ActionButton click actions
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
		minWidth: rem(48),
		height: rem(48),
		padding: rem(12),
		gap: rem(8),
		backgroundColor: theme.other.colors.secondary.white,
		'&:not([data-disabled])': theme.fn.hover({
			backgroundColor: theme.other.colors.primary.lightGray,
		}),
	},
	buttonPressed: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		minWidth: rem(48),
		height: rem(48),
		padding: rem(12),
		gap: rem(8),
		backgroundColor: theme.other.colors.primary.lightGray,
		'&:not([data-disabled])': theme.fn.hover({
			backgroundColor: theme.other.colors.primary.lightGray,
		}),
	},
	icon: {},
	text: {
		fontWeight: theme.other.fontWeight.semibold,
		marginLeft: rem(8),
	},
	dropdown: {
		background: theme.other.colors.secondary.black,
		borderRadius: theme.radius.md,
		paddingTop: rem(2),
		paddingBottom: rem(2),
	},
	item: {
		color: 'white',
		fontWeight: theme.other.fontWeight.semibold,
		fontSize: theme.fontSizes.md,
		'&[data-hovered]': {
			backgroundColor: 'inherit',
			// color: 'black',
			textDecoration: 'underline',
		},
	},
}))

/** Used to display the action buttons when viewing an organization/location/service. */
export const ActionButtons = ({ iconKey, omitLabel = false, outsideMoreMenu, children }: Props) => {
	const { classes } = useStyles()
	const theme = useMantineTheme()
	const { t } = useTranslation()
	const iconRender = actionButtonIcons[iconKey]
	const handler = actions[iconKey]
	const { more: _, ...overFlowItems } = actionButtonIcons
	const saveItems = ['List 1', 'List 2'] /* this will be the users lists */

	const [opened, setOpened] = useState(false)

	let filteredOverflowItems = Object.entries(overFlowItems)

	if (outsideMoreMenu)
		/* Keep overFlowItems where the key is not in outsideMoreMenu array */
		filteredOverflowItems = filteredOverflowItems.filter(([key, item]) => !outsideMoreMenu.includes(key))

	const overflowMenuItems = filteredOverflowItems.map(([key, item]) => (
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
				className={'labelKey' in iconRender ? undefined : classes.icon}
				height={24}
				width={24}
			/>
			{!omitLabel && 'labelKey' in iconRender && (
				<Text className={classes.text}>{children ? children : t(iconRender.labelKey)}</Text>
			)}
		</Button>
	)

	/** The menu component */
	const menuComponent = (
		<Menu position='bottom-start' opened={opened} onChange={setOpened} classNames={classes}>
			<Menu.Target>{buttonComponent}</Menu.Target>
			<Menu.Dropdown>{menuThings}</Menu.Dropdown>
		</Menu>
	)

	return 'useMenu' in iconRender ? menuComponent : buttonComponent
}

type Props = {
	/**
	 * The action button is created using an iconKey, which, depending on the value supplied, will display
	 * either an icon and a label or just an icon
	 */
	iconKey: keyof typeof actionButtonIcons
	/** Display icon only */
	omitLabel?: boolean
	/** Specify which buttons will be displayed in the 'more' dropdown menu */
	outsideMoreMenu?: string[]
	children?: string | DefaultTFuncReturn
}
