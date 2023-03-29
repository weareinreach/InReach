import {
	Box,
	Button,
	type ButtonProps,
	Center,
	createStyles,
	createPolymorphicComponent,
	Loader,
	Menu,
	Group,
	Modal,
	Text,
	TextInput,
	useMantineTheme,
	rem,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useClipboard, useDisclosure } from '@mantine/hooks'
import { type ApiInput } from '@weareinreach/api'
import { DefaultTFuncReturn } from 'i18next'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { useState, forwardRef } from 'react'

import { QuickPromotionModal, ReviewModal } from 'modals'
import { Icon, IconList } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { useNewNotification } from '../../hooks'

export const actionButtonIcons = {
	save: {
		icon: 'carbon:favorite',
		labelKey: 'save',
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

/**
 * Returns a Modal with a form to give a name to a new list, its target is a menu item. Creates a new list and
 * saves the current organization or service to it.
 *
 * @param data - Contains list information
 * @param data.name - Name for the new list
 * @param data.organizationId - String | undefined
 * @param data.serviceId - String | undefined
 * @returns JSX.Element
 */
const NewListModal = ({ data, ...props }: NewListModalProps) => {
	const { t } = useTranslation()
	const [opened, handler] = useDisclosure(false)
	const form = useForm({
		initialValues: { listName: '' },
		validate: {
			listName: (value: string) => (value.length > 0 ? null : t('new-list-name-invalid')),
		},
	})

	const savedInList = useNewNotification({ icon: 'info', displayTextKey: t('saved-in-list') as string })
	const errorSaving = useNewNotification({ icon: 'warning', displayTextKey: t('error-saving') as string })

	const { mutate, isError, isSuccess, reset } = api.savedList.createAndSaveItem.useMutation()

	const submit = form.onSubmit((values) => {
		data.name = values.listName
		mutate(data)
	})

	if (isError) {
		errorSaving()
		reset()
	}

	if (isSuccess) {
		savedInList()
		reset()
		close()
	}

	return (
		<>
			<Modal opened={opened} onClose={() => handler.close()}>
				<form onSubmit={submit}>
					<TextInput placeholder={t('service-list-name') as string} {...form.getInputProps('listName')} />
					<Button type='submit'>{t('create-list')}</Button>
				</form>
			</Modal>
			<Menu.Item onClick={() => handler.open()}>{t('create-list')}</Menu.Item>
		</>
	)
}

/**
 * Returns a Menu Item with the new of an existing list. When clicked it saves the current organization or
 * service to the list.
 *
 * @param data - Contains information about the list
 * @param data.id - List id : string
 * @param data.organizationId - String | undefined
 * @param data.serviceId - String | undefined
 * @param name - List name : string
 * @returns JSX.Element
 */
const SaveItem = ({ data, name }: AlterListProps) => {
	const { t } = useTranslation()
	const { mutate, isSuccess, isError, reset } = api.savedList.saveItem.useMutation()

	const savedInList = useNewNotification({ icon: 'info', displayTextKey: t('saved-in-list') as string })
	const errorSaving = useNewNotification({ icon: 'warning', displayTextKey: t('error-saving') as string })

	if (isSuccess) {
		savedInList()
	}

	if (isError) {
		errorSaving()
		reset()
	}

	return (
		<Menu.Item
			onClick={() => {
				mutate(data)
			}}
		>
			{name}
		</Menu.Item>
	)
}

/**
 * Polymorphic component, returns a Menu with a Menu dropdown containing the NewListModal and SaveItem
 * components. The menu target is the polymorphic element.
 *
 * @returns Polymorphic button component
 */
const SavePolymorphic = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
	const { t } = useTranslation()
	const saveLists = api.savedList.getAll.useQuery()
	const { classes } = useStyles()
	const [opened, setOpened] = useState(false)

	// ADD CORRECT INFORMATION TO ORGANIZATION ID
	const createNewList = <NewListModal data={{ name: '', organizationId: '' }} />

	let saveMenuItems: JSX.Element | JSX.Element[] = (
		<Menu.Item>
			<Center>
				<Loader />
			</Center>
		</Menu.Item>
	)

	if (saveLists.isError)
		saveMenuItems = (
			<Menu.Item onClick={() => saveLists.refetch()} closeMenuOnClick={false}>
				<Center>{t('retry')}</Center>
			</Menu.Item>
		)

	if (saveLists.status === 'success' && saveLists.data)
		saveMenuItems = saveLists.data.map(({ id, name }) => (
			// ADD CORRECT INFORMATION TO serviceId
			<SaveItem key={id} data={{ id, serviceId: '' }} name={name} />
		))

	return (
		<Menu
			position='bottom-start'
			opened={opened}
			onClose={() => {
				setOpened(false)
			}}
			onOpen={() => {
				setOpened(true)
			}}
			classNames={classes}
			keepMounted
		>
			<Menu.Target>
				<Box component='button' ref={ref} {...props} />
			</Menu.Target>
			<Menu.Dropdown>
				{createNewList}
				{saveMenuItems}
			</Menu.Dropdown>
		</Menu>
	)
})

SavePolymorphic.displayName = 'SaveButton'

const SaveButton = createPolymorphicComponent<'button', ButtonProps>(SavePolymorphic)

/**
 * Polymorphic component, returns a button. When clicked saves the current url to the clients clipboard
 *
 * @returns Polymorphic button component
 */
const CopyToClipBoard = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
	const { t } = useTranslation()
	const { basePath, asPath, locale } = useRouter()
	const clipboard = useClipboard({ timeout: 500 })
	const copiedToClipboard = useNewNotification({ icon: 'info', displayTextKey: t('link-copied') as string })

	const handleCopy = () => {
		const href = `${basePath}${asPath}${locale}`
		clipboard.copy(href)
		copiedToClipboard()
	}

	return <Box component='button' ref={ref} onClick={handleCopy} {...props} />
})

CopyToClipBoard.displayName = 'CopyToClipboard'

const ShareLink = createPolymorphicComponent<'button', ButtonProps>(CopyToClipBoard)

/**
 * Polymorphic component.
 *
 * Returns a button when current organization or service is only saved in one of the user's lists. When
 * clicked it deletes said item from the list
 *
 * Returns a Menu when organization or service is saved in two or more user lists. Menu Dropdown contains all
 * lists. Menu Target is the polymorphic component. Clicking a Menu Item in the menu dropdown removes the item
 * from the list.
 *
 * @returns Polymorphic button component
 */
const UnsaveItemBody = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
	const { classes } = useStyles()
	const { t } = useTranslation()
	const data = {
		id: '',
		organizationId: '',
	}
	const savedInLists = api.savedList.isSaved.useQuery(data.organizationId)
	const unsave = api.savedList.deleteItem.useMutation()
	const [opened, setOpened] = useState(false)

	const removedFromList = useNewNotification({
		icon: 'info',
		displayTextKey: t('removed-from-list') as string,
	})
	const errorRemoving = useNewNotification({ icon: 'warning', displayTextKey: t('error-removing') as string })

	if (unsave.isSuccess) {
		unsave.reset()
		removedFromList()
	}

	if (unsave.isError) {
		unsave.reset()
		errorRemoving()
	}

	if (savedInLists.isSuccess && savedInLists.data) {
		if (savedInLists.data.length === 1) {
			return (
				<Box
					onClick={() => {
						unsave.mutate(data)
					}}
					component='button'
					ref={ref}
					{...props}
				/>
			)
		} else {
			const listItems = savedInLists.data.map(({ name, id }) => (
				<Menu.Item
					key={id}
					onClick={() => {
						unsave.mutate({ id: id })
					}}
				>
					{name}
				</Menu.Item>
			))
			return (
				<Menu
					position='bottom-start'
					opened={opened}
					onClose={() => {
						setOpened(false)
					}}
					onOpen={() => {
						setOpened(true)
					}}
					classNames={classes}
					keepMounted
				>
					<Menu.Target>
						<Box component='button' ref={ref} {...props} />
					</Menu.Target>
					<Menu.Dropdown>{listItems}</Menu.Dropdown>
				</Menu>
			)
		}
	}

	return (
		<Box component='button' ref={ref} {...props}>
			<Center>
				<Loader />
			</Center>
		</Box>
	)
})

UnsaveItemBody.displayName = 'UnsaveItem'

const UnsaveButton = createPolymorphicComponent<'button', ButtonProps>(UnsaveItemBody)

/**
 * Polymorphic element, returns a button. When clicked takes a screenshot of the current client view
 *
 * @returns Polymorphic button component
 */
const PrintBody = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
	<Box
		component='button'
		ref={ref}
		onClick={() => {
			window.print()
		}}
		{...props}
	/>
))

PrintBody.displayName = 'Print'

const PrintButton = createPolymorphicComponent<'button', ButtonProps>(PrintBody)

// TODO: [IN-786] Associate ActionButton click actions

// Previous actions object is now a hook to check user session before using save or saved actions
const useActions = () => {
	const { data: session } = useSession()

	/**
	 * Curried function which accepts a Polymorphic button element as its base param. The inner function returns
	 * a JSX component.
	 *
	 * @param Polymorphic - Accepts the return value of the createPolymorphicComponent function
	 * @param isMenu - Boolean. If true, the component prop for the Polymorphic element will be Menu.Item, else
	 *   it will be Button
	 * @param children - JSX.Element
	 * @param props - ButtonProps. Its main use is to handle component styling
	 * @returns A function which returns a JSX.Element
	 */
	const generic = (Polymorphic: Polymorphic) => {
		const action = ({ isMenu, children, props }: Generic) => {
			if (isMenu)
				return (
					<Polymorphic component={Menu.Item} {...props}>
						{children}
					</Polymorphic>
				)

			return (
				<Polymorphic component={Button} {...props}>
					{children}
				</Polymorphic>
			)
		}
		return action
	}

	return {
		delete: generic(QuickPromotionModal), // TODO: assign behaviour to delete button
		more: generic(createPolymorphicComponent<'button', ButtonProps>(Button)),
		print: generic(PrintButton),
		review: generic(ReviewModal),
		save: generic(session ? SaveButton : QuickPromotionModal),
		saved: generic(session ? UnsaveButton : QuickPromotionModal),
		share: generic(ShareLink),
	} as const
}

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
export const ActionButtons = ({ iconKey, omitLabel = false, outsideMoreMenu, children, ...props }: Props) => {
	const { data: session } = useSession()
	const { classes } = useStyles()
	const theme = useMantineTheme()
	const { t } = useTranslation()
	const iconRender = actionButtonIcons[iconKey]
	const { more: _, ...overFlowItems } = actionButtonIcons
	const actions = useActions()
	const [opened, setOpened] = useState(false)

	let filteredOverflowItems = Object.entries(overFlowItems)

	if (outsideMoreMenu)
		/* Keep overFlowItems where the key is not in outsideMoreMenu array */
		filteredOverflowItems = filteredOverflowItems.filter(([key, item]) => !outsideMoreMenu.includes(key))

	const overflowMenuItems = filteredOverflowItems.map(([key, item]) => {
		const children = (
			<Group>
				<Icon icon={item.icon} />
				{t(item.labelKey)}
			</Group>
		)
		return actions[key as keyof typeof actionButtonIcons]({ isMenu: true, children })
	})

	const menuThings = overflowMenuItems

	const buttonProps = {
		className: opened ? classes.buttonPressed : classes.button,
		radius: 'md',
	}

	/** The button component */
	const buttonIcon = (
		<>
			<Icon
				icon={iconRender.icon}
				color={theme.other.colors.secondary.black}
				className={'labelKey' in iconRender ? undefined : classes.icon}
				height={24}
				width={24}
			/>
			{!omitLabel && 'labelKey' in iconRender && (
				<Text className={classes.text}>{children ? children : t(iconRender.labelKey, { count: 1 })}</Text>
			)}
		</>
	)

	const buttonComponent = actions[iconKey]({ children: buttonIcon, props: buttonProps })

	/** The menu component */
	const menuComponent = (
		<>
			<Menu
				position='bottom-start'
				opened={opened}
				onChange={setOpened}
				zIndex={200}
				classNames={classes}
				keepMounted
			>
				<Menu.Target>{buttonComponent}</Menu.Target>
				<Menu.Dropdown>{menuThings}</Menu.Dropdown>
			</Menu>
		</>
	)

	if ((iconKey === 'saved' || iconKey === 'save') && !session) return buttonComponent

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
	/** Information for save button */
	saveOrg?: string
	saveService?: string
}

type NewListModalProps = {
	data: ApiInput['savedList']['createAndSaveItem']
} & ButtonProps

type UserListMutation = {
	data: ApiInput['savedList']['saveItem'] | ApiInput['savedList']['deleteItem']
	name?: string
}

type AlterListProps = UserListMutation & ButtonProps

type Polymorphic = typeof QuickPromotionModal | typeof ReviewModal

type Generic = {
	children: JSX.Element
	isMenu?: boolean
	props?: ButtonProps
}
