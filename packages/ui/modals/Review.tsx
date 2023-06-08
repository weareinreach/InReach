import { Box, type ButtonProps, createPolymorphicComponent, Modal } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { forwardRef } from 'react'

import { UserReviewSubmit } from '~ui/components/core/UserReviewSubmit'
import { useScreenSize } from '~ui/hooks/useScreenSize'

import { ModalTitle } from './ModalTitle'

export const ReviewModalBody = forwardRef<HTMLButtonElement, ReviewModalProps>((props, ref) => {
	const [opened, handler] = useDisclosure(false)
	const { isMobile } = useScreenSize()
	const modalTitle = <ModalTitle breadcrumb={{ option: 'close', onClick: () => handler.close() }} />

	return (
		<>
			<Modal title={modalTitle} opened={opened} onClose={() => handler.close()} fullScreen={isMobile}>
				<UserReviewSubmit type='modal' />
			</Modal>
			<Box component='button' ref={ref} onClick={() => handler.open()} {...props} />
		</>
	)
})

ReviewModalBody.displayName = 'ReviewModal'

export const ReviewModal = createPolymorphicComponent<'button', ReviewModalProps>(ReviewModalBody)

export type ReviewModalProps = ButtonProps
