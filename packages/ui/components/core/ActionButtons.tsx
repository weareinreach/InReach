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
	Skeleton,
	Text,
	useMantineTheme,
	rem,
} from '@mantine/core'
import { useClipboard } from '@mantine/hooks'
import { type ApiInput } from '@weareinreach/api'
import { DefaultTFuncReturn } from 'i18next'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { useState, forwardRef, ComponentType } from 'react'

import { useNewNotification } from '~ui/hooks'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'
import { CreateNewList } from '~ui/modals/CreateNewList'
import { QuickPromotionModal } from '~ui/modals/QuickPromotion'
import { ReviewModal } from '~ui/modals/Review'

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
		borderRadius: rem(8),
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
		'& > *': {
			color: 'white !important',
		},
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

export const actionButtonIcons = {
	save: {
		icon: 'carbon:favorite',
		labelKey: 'words.save',
	},
	share: { icon: 'carbon:share', labelKey: 'words.share' },
	print: { icon: 'carbon:printer', labelKey: 'words.print' },
	review: { icon: 'carbon:star', labelKey: 'words.review' },
	delete: { icon: 'carbon:delete', labelKey: 'words.delete' },
	more: {
		icon: 'carbon:overflow-menu-horizontal',
		useMenu: true,
	},
} as const

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
const ListItem = ({ data, name, action }: ListMenuProps) => {
	const { t } = useTranslation()

	const savedInList = useNewNotification({
		icon: 'heartFilled',
		displayText: t('list.added', { name }),
	})
	const errorSaving = useNewNotification({
		icon: 'warning',
		displayText: t('list.error-add'),
	})
	const deletedInList = useNewNotification({
		icon: 'heartEmpty',
		displayText: t('list.removedMulti', { name }),
	})
	const errorRemoving = useNewNotification({
		icon: 'warning',
		displayText: t('list.error-remove'),
	})

	const saveItem = api.savedList.saveItem.useMutation({
		onSuccess: savedInList,
		onError: errorSaving,
	})
	const removeItem = api.savedList.deleteItem.useMutation({
		onSuccess: deletedInList,
		onError: errorRemoving,
	})
	const clickHandler = () => {
		if (action === 'save') {
			saveItem.mutate(data)
		} else {
			removeItem.mutate(data)
		}
	}

	return <Menu.Item onClick={() => clickHandler()}>{name}</Menu.Item>
}

export const SaveToggleButton = forwardRef<HTMLDivElement, SaveToggleButtonProps>(
	({ omitLabel, serviceId, organizationId, isMenu, ...rest }, ref) => {
		const [isSaved, setIsSaved] = useState(false)
		const [opened, setOpened] = useState(false)
		const [singleListId, setSingleListId] = useState<string | undefined>()
		const [singleListName, setSingleListName] = useState<string | undefined>()
		const [menuChildren, setMenuChildren] = useState<JSX.Element | JSX.Element[] | null>(
			<Menu.Item>
				<Center>
					<Loader />
				</Center>
			</Menu.Item>
		)
		const { classes } = useStyles()
		const { status: sessionStatus } = useSession()
		const { t } = useTranslation('common')
		const theme = useMantineTheme()
		const buttonIcon = isSaved ? 'carbon:favorite-filled' : 'carbon:favorite'

		api.savedList.isSaved.useQuery(serviceId ?? (organizationId as string), {
			enabled: sessionStatus === 'authenticated' && Boolean(organizationId),
			refetchOnWindowFocus: false,
			onSuccess: (data) => {
				setIsSaved(Boolean(data))
				if (!data) return
				if (data.length === 1) {
					const record = data[0]
					setMenuChildren(null)
					if (!record) return
					setSingleListId(record.id)
					setSingleListName(record.name)
					return
				}
				setMenuChildren(
					data.map(({ id, name }) => <ListItem key={id} data={{ id, ...data }} action='delete' name={name} />)
				)
			},
		})
		const savedLists = api.savedList.getAll.useQuery(undefined, {
			refetchOnWindowFocus: false,
			onError: () => {
				if (isSaved) return
				setMenuChildren(
					<Menu.Item onClick={() => savedLists.refetch()} closeMenuOnClick={false}>
						<Center>{t('retry')}</Center>
					</Menu.Item>
				)
			},
			onSuccess: (data) => {
				if (isSaved) return
				setMenuChildren(
					data ? (
						[
							<CreateNewList key='newItem' component={Menu.Item}>
								{t('list.create-new')}
							</CreateNewList>,
							...data.map(({ id, name }) => (
								<ListItem key={id} data={{ id, ...data }} action='save' name={name} />
							)),
						]
					) : (
						<CreateNewList component={Menu.Item}>{t('list.create-new')}</CreateNewList>
					)
				)
			},
		})
		const deletedInList = useNewNotification({
			icon: 'heartEmpty',
			displayText: t('list.removedMulti', { name: singleListName }),
		})
		const errorRemoving = useNewNotification({
			icon: 'warning',
			displayText: t('list.error-remove'),
		})
		const removeItem = api.savedList.deleteItem.useMutation({
			onSuccess: deletedInList,
			onError: errorRemoving,
		})

		let ButtonInner = (
			<>
				<Icon
					icon={buttonIcon}
					color={theme.other.colors.secondary[isMenu ? 'white' : 'black']}
					className={classes.icon}
					{...(isMenu ? {} : { height: 24, width: 24 })}
				/>
				{!omitLabel && (
					<Text
						fw={isMenu ? 500 : undefined}
						color={theme.other.colors.secondary[isMenu ? 'white' : 'black']}
						className={isMenu ? undefined : classes.text}
					>
						{t(isSaved ? 'words.saved' : 'words.save')}
					</Text>
				)}
			</>
		)

		if (isMenu) ButtonInner = <Group>{ButtonInner}</Group>

		// BUG: [IN-808] "Save" not receving correct styles when it's in the overflow menu.
		if (sessionStatus !== 'authenticated') {
			return (
				<QuickPromotionModal ref={ref} component={Button} className={classes.button} radius='md'>
					{ButtonInner}
				</QuickPromotionModal>
			)
		}

		if (isSaved && singleListId) {
			return (
				<Box ref={ref} {...rest}>
					<Button
						className={classes.button}
						radius='md'
						onClick={() => removeItem.mutate({ id: singleListId, organizationId, serviceId })}
					>
						{ButtonInner}
					</Button>
				</Box>
			)
		}
		return (
			<Menu
				position='bottom-start'
				opened={opened}
				onOpen={() => setOpened(true)}
				onClose={() => setOpened(false)}
				classNames={classes}
				keepMounted
			>
				<Menu.Target>
					<Box ref={ref} component={Menu.Item} {...rest}>
						{ButtonInner}
					</Box>
				</Menu.Target>
				<Menu.Dropdown>{menuChildren}</Menu.Dropdown>
			</Menu>
		)
	}
)
SaveToggleButton.displayName = 'SaveToggleButton'

const SaveButton = createPolymorphicComponent<'button', SaveToggleButtonProps>(SaveToggleButton)

/**
 * Polymorphic component, returns a button. When clicked saves the current url to the clients clipboard
 *
 * @returns Polymorphic button component
 */
const CopyToClipBoard = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
	const { t } = useTranslation()
	const { asPath } = useRouter()
	const clipboard = useClipboard({ timeout: 500 })
	const copiedToClipboard = useNewNotification({ icon: 'info', displayText: t('link-copied') })

	const handleCopy = () => {
		const href = `${window.location.origin}${asPath}`
		clipboard.copy(href)
		copiedToClipboard()
	}

	return <Box component='button' ref={ref} onClick={handleCopy} {...props} />
})

CopyToClipBoard.displayName = 'CopyToClipboard'

const ShareLink = createPolymorphicComponent<'button', ButtonProps>(CopyToClipBoard)

/**
 * Polymorphic element, returns a button. When clicked takes a screenshot of the current client view
 *
 * @returns Polymorphic button component
 */
const PrintBody = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
	<Box component='button' ref={ref} onClick={() => window.print()} {...props} />
))

PrintBody.displayName = 'Print'

const PrintButton = createPolymorphicComponent<'button', ButtonProps>(PrintBody)

// TODO: [IN-786] Associate ActionButton click actions

// Previous actions object is now a hook to check user session before using save or saved actions
const useActions = () => {
	const { data: session } = useSession()
	const { classes } = useStyles()
	/**
	 * Curried function which accepts a Polymorphic button element as its base param. The inner function returns
	 * a JSX component.
	 *
	 * @param Component - Accepts the return value of the createPolymorphicComponent function
	 * @param isMenu - Boolean. If true, the component prop for the Polymorphic element will be Menu.Item, else
	 *   it will be Button
	 * @param children - JSX.Element
	 * @param props - ButtonProps. Its main use is to handle component styling
	 * @returns A function which returns a JSX.Element
	 */
	const generic = (Component: Polymorphic | ComponentType) => {
		const action = ({ isMenu, children, props }: Generic) => {
			if (isMenu)
				return (
					<Component component={Menu.Item} className={classes.item} {...{ isMenu, ...props }}>
						{children}
					</Component>
				)

			return (
				<Component component={Button} className={classes.button} {...props}>
					{children}
				</Component>
			)
		}
		return action
	}

	return {
		// TODO: assign behaviour to delete button
		delete: generic(QuickPromotionModal),
		more: generic(createPolymorphicComponent<'button', ButtonProps>(Button)),
		print: generic(PrintButton),
		review: generic(ReviewModal),
		save: generic(SaveToggleButton),
		share: generic(ShareLink),
	} as const
}

/**
 * Used to display the action buttons when viewing an organization/location/service.
 *
 * When using the save or unsave buttons for services, you need to pass the serviceId prop.
 *
 * When trying to save or unsave an organization, the component parses the current URL to find the
 * organization's id, so you don't need to pass it as a prop.
 */
export const ActionButtons = ({
	iconKey,
	omitLabel = false,
	serviceId,
	outsideMoreMenu,
	children,
}: ActionButtonProps) => {
	const { classes } = useStyles()
	const theme = useMantineTheme()
	const { t } = useTranslation()
	const iconRender = actionButtonIcons[iconKey]
	const { more: _, ...overFlowItems } = actionButtonIcons
	const actions = useActions()
	const [opened, setOpened] = useState(false)
	const { query: rawQuery } = useRouter()
	const { slug } = rawQuery

	const { data: orgQuery } = api.organization.getIdFromSlug.useQuery({ slug: slug as string })

	const orgOrServiceId = { organizationId: orgQuery?.id ?? '', serviceId }

	let filteredOverflowItems = Object.entries(overFlowItems)

	if (outsideMoreMenu)
		/* Keep overFlowItems where the key is not in outsideMoreMenu array */
		filteredOverflowItems = filteredOverflowItems.filter(([key, item]) => !outsideMoreMenu.includes(key))

	const overflowMenuItems = filteredOverflowItems.map(([key, item]) => {
		const children = (
			<Group key={key}>
				<Icon key={key} icon={item.icon} />
				{t(item.labelKey)}
			</Group>
		)

		return actions[key as keyof typeof actionButtonIcons]({ isMenu: true, children, ...orgOrServiceId })
	})

	const menuThings = overflowMenuItems

	const buttonProps = {
		className: opened ? classes.buttonPressed : classes.button,
		radius: 'md',
		...orgOrServiceId,
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
	)

	return 'useMenu' in iconRender ? menuComponent : buttonComponent
}
const Loading = () => <Skeleton h={22} w={70} radius={8} />

ActionButtons.Loading = Loading

interface ActionButtonProps {
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
	serviceId?: string
}

type UserListMutation = {
	data: ApiInput['savedList']['saveItem'] | ApiInput['savedList']['deleteItem']
	name?: string
}

type Polymorphic = typeof QuickPromotionModal | typeof ReviewModal | typeof SaveButton

type PolymorphicProps = ButtonProps & { serviceId?: string; organizationId: string }

type Generic = {
	children?: JSX.Element
	isMenu?: boolean
	props?: ButtonProps | PolymorphicProps
}

export interface SaveToggleButtonProps extends Omit<ActionButtonProps, 'children' | 'iconKey'> {
	organizationId?: string
	serviceId?: string
	isMenu?: boolean
}

type ListMenuProps = SaveMenuProps | DeleteMenuProps
interface SaveMenuProps extends ButtonProps {
	data: ApiInput['savedList']['saveItem']
	name: string
	action: 'save'
}
interface DeleteMenuProps extends ButtonProps {
	data: ApiInput['savedList']['deleteItem']
	name: string
	action: 'delete'
}
