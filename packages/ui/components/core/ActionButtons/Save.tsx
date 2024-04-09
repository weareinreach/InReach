import { type ButtonProps, Menu } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { useCallback, useMemo } from 'react'

import { type ApiInput } from '@weareinreach/api'
import { useNewNotification } from '~ui/hooks/useNewNotification'
import { trpc as api } from '~ui/lib/trpcClient'

import { useStyles } from './styles'

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
		onSuccess: (_, { organizationId, serviceId }) => {
			savedInList()
			utils.savedList.isSaved.invalidate(serviceId ?? organizationId)
		},
		onError: errorSaving,
	})
	const removeItem = api.savedList.deleteItem.useMutation({
		onSuccess: (_, { organizationId, serviceId }) => {
			deletedInList()
			utils.savedList.isSaved.invalidate(serviceId ?? organizationId)
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

export const Save = ({ itemId }: ActionButtonSaveProps) => {
	const [opened, handler] = useDisclosure(false)
	const { classes } = useStyles()
	const { status: sessionStatus, update } = useSession()
	const { t } = useTranslation('common')
	const utils = api.useUtils()

	const userIsLoggedIn = useMemo(() => sessionStatus === 'authenticated', [sessionStatus])

	const { data: savedToLists } = api.savedList.isSaved.useQuery(itemId, {
		enabled: userIsLoggedIn,
	})
}

export interface ActionButtonSaveProps {
	itemId: string
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
