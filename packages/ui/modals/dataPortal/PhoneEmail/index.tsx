import { Box, type ButtonProps, createPolymorphicComponent, Modal } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { forwardRef, useState } from 'react'

import { trpc as api } from '~ui/lib/trpcClient'
import { ModalTitle } from '~ui/modals/ModalTitle'

const PhoneEmailModalBody = forwardRef<HTMLButtonElement, PhoneEmailModalProps>(({ role, ...props }, ref) => {
	const [opened, handler] = useDisclosure(false)
	const modalTitle = <ModalTitle breadcrumb={{ option: 'close', onClick: () => handler.close() }} />

	const savePhone = api.orgPhone.create.useMutation()
	const saveEmail = api.orgEmail.create.useMutation()

	return (
		<>
			<Modal title={modalTitle} opened={opened} onClose={handler.close}></Modal>
			<Box component='button' ref={ref} onClick={handler.open} {...props} />
		</>
	)
})
PhoneEmailModalBody.displayName = 'PhoneEmailModal'

export const PhoneEmailModal = createPolymorphicComponent<'button', PhoneEmailModalProps>(PhoneEmailModalBody)
export interface PhoneEmailModalProps extends ButtonProps {
	role: 'phone' | 'email'
}
