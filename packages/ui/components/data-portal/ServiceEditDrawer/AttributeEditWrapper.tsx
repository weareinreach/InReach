import { ActionIcon, Group, Modal, Skeleton, Text, Tooltip, useMantineTheme } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { type ReactNode, useCallback, useMemo } from 'react'

import { isIdFor } from '@weareinreach/db/lib/idGen'
import { Button } from '~ui/components/core/Button'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'
import { AttributeForm, type AttributeModalProps } from '~ui/modals/dataPortal/Attributes'
import { type FormSchema } from '~ui/modals/dataPortal/Attributes/schema'
import { ModalText } from '~ui/modals/Service/ModalText'

export const AttributeEditWrapper = ({
	active,
	id,
	children,
	editable,
	parentRecord,
}: AttributeEditWrapperProps) => {
	const theme = useMantineTheme()
	const [confirmModalOpen, confirmModalHandler] = useDisclosure(false)
	const [editModalOpen, editModalHandler] = useDisclosure(false)
	const apiUtils = api.useUtils()
	const toggleOrDeleteAttribute = api.component.AttributeEditWrapper.useMutation({
		// `id` can belong to a phone/email/website row (when this wrapper is used from
		// ContactInfo) or a service attribute (its original use in ServiceEditDrawer) --
		// invalidate whichever router's cache actually holds the record that changed.
		onSuccess: () => {
			if (isIdFor('orgPhone', id)) {
				return apiUtils.orgPhone.invalidate()
			}
			if (isIdFor('orgEmail', id)) {
				return apiUtils.orgEmail.invalidate()
			}
			if (isIdFor('orgWebsite', id)) {
				return apiUtils.orgWebsite.invalidate()
			}
			return apiUtils.service.forServiceEditDrawer.invalidate()
		},
	})
	const updateAttribute = api.component.AttributeEditWrapper.useMutation({
		onSuccess: () => {
			editModalHandler.close()
			return apiUtils.service.forServiceEditDrawer.invalidate()
		},
	})
	const { data: attributeDetail, isLoading: isDetailLoading } =
		api.component.AttributeEditWrapperDetail.useQuery({ id }, { enabled: editModalOpen })
	const handleToggle = useCallback(
		() => toggleOrDeleteAttribute.mutate({ id, action: 'toggleActive' }),
		[id, toggleOrDeleteAttribute]
	)
	const handleDelete = useCallback(
		() => toggleOrDeleteAttribute.mutate({ id, action: 'delete' }),
		[id, toggleOrDeleteAttribute]
	)
	const handleSaveEdit = useCallback(
		(formData: FormSchema) => {
			updateAttribute.mutate({
				id,
				action: 'update',
				boolean: formData.boolean,
				data: formData.data,
				text: formData.text,
				countryId: formData.countryId,
				govDistId: formData.govDistId,
				languageId: formData.languageId,
			})
		},
		[id, updateAttribute]
	)
	const editIcon = useMemo(() => {
		if (editable) {
			return (
				<Tooltip label='Edit'>
					<ActionIcon variant='subtle' onClick={editModalHandler.open}>
						<Icon icon='carbon:edit' color={theme.other.colors.primary.allyGreen} />
					</ActionIcon>
				</Tooltip>
			)
		}
		return (
			<Tooltip label='Not Editable'>
				<ActionIcon variant='subtle' disabled>
					<Icon icon='carbon:edit-off' />
				</ActionIcon>
			</Tooltip>
		)
	}, [editable, editModalHandler.open, theme.other.colors.primary.allyGreen])

	const activeToggleIcon = useMemo(() => {
		if (active) {
			return (
				<Tooltip label='Deactivate'>
					<ActionIcon variant='subtle' onClick={handleToggle}>
						<Icon icon='carbon:view' color={theme.other.colors.primary.allyGreen} />
					</ActionIcon>
				</Tooltip>
			)
		}
		return (
			<Tooltip label='Activate'>
				<ActionIcon variant='subtle' onClick={handleToggle}>
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
				{editable && parentRecord && (
					<Modal opened={editModalOpen} onClose={editModalHandler.close} title='Edit Attribute'>
						<Skeleton visible={isDetailLoading}>
							{attributeDetail && (
								<AttributeForm
									key={id}
									parentRecord={parentRecord}
									selectedAttr={attributeDetail}
									existingId={id}
									initialValues={{
										text: attributeDetail.text ?? undefined,
										boolean: attributeDetail.boolean ?? undefined,
										data: attributeDetail.data as FormSchema['data'],
										countryId: attributeDetail.countryId ?? undefined,
										govDistId: attributeDetail.govDistId ?? undefined,
										languageId: attributeDetail.languageId ?? undefined,
									}}
									onSave={handleSaveEdit}
									isLoading={updateAttribute.isPending}
								/>
							)}
						</Skeleton>
					</Modal>
				)}
				<Modal opened={confirmModalOpen} onClose={confirmModalHandler.close} title='Delete Attribute'>
					<Text>Are you sure you want to delete this attribute?</Text>
					<Group wrap='nowrap'>
						<Button onClick={confirmModalHandler.close}>Cancel</Button>
						<Button onClick={handleDelete}>Delete</Button>
					</Group>
				</Modal>
				<Tooltip label='Delete'>
					<ActionIcon variant='subtle' onClick={confirmModalHandler.open}>
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
	/**
	 * Required for the edit flow to work - the create/edit modal's parent-scoping shape. Only
	 * `ServiceEditDrawer` (the one caller with `editable` ever true) passes this.
	 */
	parentRecord?: AttributeModalProps['parentRecord']
}
