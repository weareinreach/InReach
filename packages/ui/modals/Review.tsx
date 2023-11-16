import { Box, type ButtonProps, createPolymorphicComponent, Group, Modal } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { forwardRef } from 'react'

import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { UserReviewSubmit } from '~ui/components/core/UserReviewSubmit'
import { useScreenSize } from '~ui/hooks/useScreenSize'

const ReviewModalBody = forwardRef<HTMLButtonElement, ReviewModalProps>((props, ref) => {
	const [opened, handler] = useDisclosure(false)
	const { isMobile } = useScreenSize()
	const modalTitle = (
		<Group position='apart' align='center' noWrap>
			<Box maw='70%' style={{ overflow: 'hidden' }}>
				<Breadcrumb onClick={handler.close} option='close' />
			</Box>
		</Group>
	)

	return (
		<>
			<Modal title={modalTitle} opened={opened} onClose={() => handler.close()} fullScreen={isMobile}>
				<UserReviewSubmit type='modal' closeModalHandler={handler.close} />
			</Modal>
			<Box component='button' ref={ref} onClick={() => handler.open()} {...props} />
		</>
	)
})

ReviewModalBody.displayName = 'ReviewModal'

export const ReviewModal = createPolymorphicComponent<'button', ReviewModalProps>(ReviewModalBody)

export type ReviewModalProps = ButtonProps
