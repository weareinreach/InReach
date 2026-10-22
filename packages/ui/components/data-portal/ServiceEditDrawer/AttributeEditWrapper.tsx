import { ActionIcon, Group, Modal, Text, Tooltip, useMantineTheme } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { type ReactNode, useCallback, useMemo } from 'react'

import { Button } from '~ui/components/core/Button'
import { useNewNotification } from '~ui/hooks/useNewNotification'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'
import { ModalText } from '~ui/modals/Service/ModalText'

export const AttributeEditWrapper = ({ active, id, children, editable }: AttributeEditWrapperProps) => {
	const theme = useMantineTheme()
	const [confirmModalOpen, confirmModalHandler] = useDisclosure(false)
	const apiUtils = api.useUtils()
	const notifyError = useNewNotification({
		displayText: 'Something went wrong updating this item. Please try again.',
		icon: 'warning',
	})
	// `id` is always an attribute supplement's id. That includes the phone/email/website rows in a service's
	// "Get help" section (ContactInfo with `passedData`): those are access instructions stored as supplements,
	// not OrgPhone/OrgEmail/OrgWebsite records (see modals/Service/processors). Both views that render this
	// wrapper - the service edit drawer and the service modal - read the same supplements, so both refresh.
	const toggleOrDeleteAttribute = api.component.AttributeEditWrapper.useMutation({
		onSuccess: () =>
			Promise.all([
				apiUtils.service.forServiceEditDrawer.invalidate(),
				apiUtils.service.forServiceModal.invalidate(),
			]),
		onError: () => notifyError(),
	})
	const handleToggle = useCallback(
		() => toggleOrDeleteAttribute.mutate({ id, action: 'toggleActive' }),
		[id, toggleOrDeleteAttribute]
	)
	const handleDelete = useCallback(
		() => toggleOrDeleteAttribute.mutate({ id, action: 'delete' }),
		[id, toggleOrDeleteAttribute]
	)
	const handleEdit = useCallback(() => {
		alert('To be implemented later')
	}, [])
	const editIcon = useMemo(() => {
		if (editable) {
			return (
				<Tooltip label='Edit'>
					<ActionIcon variant='subtle' onClick={handleEdit} aria-label='Edit'>
						<Icon icon='carbon:edit' color={theme.other.colors.primary.allyGreen} />
					</ActionIcon>
				</Tooltip>
			)
		}
		return (
			<Tooltip label='Not Editable'>
				<ActionIcon variant='subtle' disabled aria-label='Not Editable'>
					<Icon icon='carbon:edit-off' />
				</ActionIcon>
			</Tooltip>
		)
	}, [editable, handleEdit, theme.other.colors.primary.allyGreen])

	const activeToggleIcon = useMemo(() => {
		if (active) {
			return (
				<Tooltip label='Deactivate'>
					<ActionIcon variant='subtle' onClick={handleToggle} aria-label='Deactivate'>
						<Icon icon='carbon:view' color={theme.other.colors.primary.allyGreen} />
					</ActionIcon>
				</Tooltip>
			)
		}
		return (
			<Tooltip label='Activate'>
				<ActionIcon variant='subtle' onClick={handleToggle} aria-label='Activate'>
					<Icon icon='carbon:view-off' color={theme.other.colors.primary.allyGreen} />
				</ActionIcon>
			</Tooltip>
		)
	}, [active, handleToggle, theme.other.colors.primary.allyGreen])

	return (
		<Group wrap='nowrap' gap={8} justify='space-between'>
			<div style={{ flex: 1, minWidth: 0 }}>
				{typeof children === 'string' ? <ModalText>{children}</ModalText> : children}
			</div>
			<Group wrap='nowrap' gap={0}>
				{editIcon}
				{activeToggleIcon}
				<Modal opened={confirmModalOpen} onClose={confirmModalHandler.close} title='Delete Attribute'>
					<Text>Are you sure you want to delete this attribute?</Text>
					<Group wrap='nowrap'>
						<Button onClick={confirmModalHandler.close}>Cancel</Button>
						<Button onClick={handleDelete}>Delete</Button>
					</Group>
				</Modal>
				<Tooltip label='Delete'>
					<ActionIcon variant='subtle' onClick={confirmModalHandler.open} aria-label='Delete'>
						<Icon icon='carbon:trash-can' color={theme.other.colors.tertiary.red} />
					</ActionIcon>
				</Tooltip>
			</Group>
		</Group>
	)
}

export interface AttributeEditWrapperProps {
	id: string
	children: ReactNode
	active: boolean
	editable?: boolean
}
