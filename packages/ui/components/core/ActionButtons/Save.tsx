import { Box, type ButtonProps, Center, Group, Menu, Text, useMantineTheme } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { type ComponentPropsWithRef, forwardRef, useCallback, useMemo } from 'react'

import { type ApiInput } from '@weareinreach/api'
import { Button } from '~ui/components/core/Button'
import { useNewNotification } from '~ui/hooks/useNewNotification'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'
import { CreateNewList } from '~ui/modals'
import { QuickPromotionModal } from '~ui/modals/QuickPromotion'

import { useStyles } from './styles'

const useNotifications = (listName: string) => {
	const { t } = useTranslation('common')

	return {
		saved: useNewNotification({
			icon: 'heartFilled',
			displayText: t('list.added', { name: listName }),
		}),
		deleted: useNewNotification({
			icon: 'heartEmpty',
			displayText: t('list.removedMulti', { name: listName }),
		}),
		errorSave: useNewNotification({
			icon: 'warning',
			displayText: t('list.error-add'),
		}),
		errorDelete: useNewNotification({
			icon: 'warning',
			displayText: t('list.error-remove'),
		}),
	}
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
const ListItem = ({ data, name, action }: ListMenuProps) => {
	const { t } = useTranslation()
	const utils = api.useUtils()

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
		onSuccess: (_, { itemId }) => {
			savedInList()
			utils.savedList.isSaved.invalidate(itemId)
		},
		onError: errorSaving,
	})
	const removeItem = api.savedList.deleteItem.useMutation({
		onSuccess: (_, { itemId }) => {
			deletedInList()
			utils.savedList.isSaved.invalidate(itemId)
		},
		onError: errorRemoving,
	})
	const clickHandler = useCallback(() => {
		if (action === 'save') {
			saveItem.mutate(data)
		} else {
			removeItem.mutate(data)
		}
	}, [action, data, removeItem, saveItem])

	return <Menu.Item onClick={clickHandler}>{name}</Menu.Item>
}

export const Save = forwardRef<HTMLButtonElement, ActionButtonSaveProps>(
	({ itemId, itemName, menuItem, omitLabel, ...rest }, ref) => {
		const [menuOpened, menuHandler] = useDisclosure(false)
		const { classes, cx } = useStyles()
		const { status: sessionStatus } = useSession()
		const { t } = useTranslation('common')
		const utils = api.useUtils()
		const notifications = useNotifications(itemName)
		const theme = useMantineTheme()

		const userIsLoggedIn = useMemo(() => sessionStatus === 'authenticated', [sessionStatus])

		const { data: savedToLists } = api.savedList.isSaved.useQuery(itemId, {
			enabled: userIsLoggedIn,
		})
		const {
			data: availableLists,
			isError: availableListsError,
			refetch: refetchAvailableLists,
		} = api.savedList.getAll.useQuery(undefined, {
			refetchOnWindowFocus: false,
			enabled: sessionStatus === 'authenticated',
		})
		const removeItem = api.savedList.deleteItem.useMutation({
			onSuccess: () => {
				notifications.deleted()
				utils.savedList.isSaved.invalidate(itemId)
				utils.savedList.getAll.invalidate()
			},
			onError: notifications.errorDelete,
		})

		const isSaved = Boolean(savedToLists?.length)
		const isLoggedIn = sessionStatus === 'authenticated'
		const buttonIcon = isSaved ? 'carbon:favorite-filled' : 'carbon:favorite'
		const savedToSingleList = savedToLists?.length === 1

		const baseClassname = menuItem ? undefined : classes.button
		const iconColor = menuItem ? theme.other.colors.secondary.white : theme.other.colors.secondary.black

		const modalProps: ComponentPropsWithRef<typeof QuickPromotionModal> = menuItem
			? { ref, component: Menu.Item, radius: 'md' }
			: { ref, component: Button, className: classes.button, radius: 'md' }

		const handleRemoveFromList = useCallback(
			(listId: string) => () => removeItem.mutate({ id: listId, itemId }),
			[itemId, removeItem]
		)
		const handleRefetchAvailableLists = useCallback(() => refetchAvailableLists(), [refetchAvailableLists])

		const DisplayedInfo = (
			<Group spacing={0}>
				<Icon icon={buttonIcon} color={iconColor} {...(menuItem ? {} : { height: 24, width: 24 })} />
				{!omitLabel && (
					<Text
						fw={menuItem ? 500 : undefined}
						color={iconColor}
						className={cx({ [classes.text]: !menuItem })}
					>
						{t(isSaved ? 'words.saved' : 'words.save')}
					</Text>
				)}
			</Group>
		)

		if (!isLoggedIn) {
			return <QuickPromotionModal {...modalProps}>{DisplayedInfo}</QuickPromotionModal>
		}

		if (isSaved && savedToSingleList) {
			const listId = savedToLists.at(0)?.id

			if (!listId) {
				return <>Error</>
			}

			return (
				<Box
					ref={ref}
					component={Button}
					className={baseClassname}
					radius='md'
					onClick={handleRemoveFromList(listId)}
					{...rest}
				>
					{DisplayedInfo}
				</Box>
			)
		}

		return (
			<Menu
				position='bottom-start'
				opened={menuOpened}
				onChange={menuHandler.toggle}
				classNames={classes}
				keepMounted
			>
				<Menu.Target>
					<Box ref={ref} component={Button} className={baseClassname} radius='md' {...rest}>
						{DisplayedInfo}
					</Box>
				</Menu.Target>
				<Menu.Dropdown>
					{availableListsError ? (
						<Menu.Item onClick={handleRefetchAvailableLists} closeMenuOnClick={false}>
							<Center>{t('words.retry')}</Center>
						</Menu.Item>
					) : (
						<>
							<CreateNewList component={Menu.Item}>{t('list.create-new')}</CreateNewList>
							{availableLists?.map(({ id, name }) => (
								<ListItem key={id} data={{ id, itemId }} action='save' name={name} />
							))}
						</>
					)}
				</Menu.Dropdown>
			</Menu>
		)
	}
)
Save.displayName = 'ActionButtons.Save'

export interface ActionButtonSaveProps {
	itemId: string
	itemName: string
	menuItem?: boolean
	omitLabel?: boolean
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
