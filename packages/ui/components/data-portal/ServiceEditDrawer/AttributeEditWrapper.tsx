import { ActionIcon, Button, Group, Modal, Text, Tooltip, useMantineTheme } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { type ReactNode, useCallback, useMemo } from 'react'

import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'
import { ModalText } from '~ui/modals/Service/ModalText'

export const AttributeEditWrapper = ({ active, id, children, editable }: AttributeEditWrapperProps) => {
	const theme = useMantineTheme()
	const [confirmModalOpen, confirmModalHandler] = useDisclosure(false)
	const apiUtils = api.useUtils()
	const toggleOrDeleteAttribute = api.component.AttributeEditWrapper.useMutation({
		onSuccess: () => apiUtils.service.forServiceEditDrawer.invalidate(),
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
					<ActionIcon onClick={handleEdit}>
						<Icon icon='carbon:edit' color={theme.other.colors.secondary.black} />
					</ActionIcon>
				</Tooltip>
			)
		}
		return (
			<Tooltip label='Not Editable'>
				<ActionIcon disabled>
					<Icon icon='carbon:edit-off' />
				</ActionIcon>
			</Tooltip>
		)
	}, [editable, handleEdit, theme.other.colors.secondary.black])

	const activeToggleIcon = useMemo(() => {
		if (active) {
			return (
				<Tooltip label='Deactivate'>
					<ActionIcon onClick={handleToggle}>
						<Icon icon='carbon:view' color={theme.other.colors.secondary.black} />
					</ActionIcon>
				</Tooltip>
			)
		}
		return (
			<Tooltip label='Activate'>
				<ActionIcon onClick={handleToggle}>
					<Icon icon='carbon:view-off' color={theme.other.colors.secondary.darkGray} />
				</ActionIcon>
			</Tooltip>
		)
	}, [active, handleToggle, theme.other.colors.secondary.black, theme.other.colors.secondary.darkGray])

	return (
		<Group noWrap spacing={8}>
			<Group noWrap spacing={0}>
				{editIcon}
				{activeToggleIcon}
				<Modal opened={confirmModalOpen} onClose={confirmModalHandler.close} title='Delete Attribute'>
					<Text>Are you sure you want to delete this attribute?</Text>
					<Group noWrap>
						<Button onClick={confirmModalHandler.close}>Cancel</Button>
						<Button onClick={handleDelete}>Delete</Button>
					</Group>
				</Modal>
				<Tooltip label='Delete'>
					<ActionIcon onClick={confirmModalHandler.open}>
						<Icon icon='carbon:trash-can' color={theme.other.colors.secondary.black} />
					</ActionIcon>
				</Tooltip>
			</Group>
			{typeof children === 'string' ? <ModalText>{children}</ModalText> : children}
		</Group>
	)
}

export interface AttributeEditWrapperProps {
	id: string
	children: ReactNode
	active: boolean
	editable?: boolean
}
