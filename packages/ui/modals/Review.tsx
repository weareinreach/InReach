import { type ButtonProps, Modal, Box, createPolymorphicComponent, Space } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { forwardRef } from 'react'

import { ModalTitle } from './ModalTitle'
import { UserReviewSubmit } from '../components/core/UserReviewSubmit'

export const ReviewModalBody = forwardRef<HTMLButtonElement, ReviewModalProps>((props, ref) => {
	const [opened, handler] = useDisclosure(false)

	const modalTitle = <ModalTitle breadcrumb={{ option: 'close', onClick: () => handler.close() }} />

	return (
		<>
			<Modal title={modalTitle} opened={opened} onClose={() => handler.close()}>
				<Space h={40} />
				<UserReviewSubmit type='modal' />
			</Modal>
			<Box component='button' ref={ref} onClick={() => handler.open()} {...props} />
		</>
	)
})

ReviewModalBody.displayName = 'ReviewModal'

export const ReviewModal = createPolymorphicComponent<'button', ReviewModalProps>(ReviewModalBody)

export interface ReviewModalProps extends ButtonProps {}
