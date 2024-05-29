import { Box, createPolymorphicComponent, Group, Modal } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { forwardRef } from 'react'

import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button, type ButtonProps } from '~ui/components/core/Button'
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
			<Modal title={modalTitle} opened={opened} onClose={handler.close} fullScreen={isMobile}>
				<UserReviewSubmit type='modal' closeModalHandler={handler.close} />
			</Modal>
			<Box component={Button} ref={ref} onClick={handler.open} {...props} />
		</>
	)
})

ReviewModalBody.displayName = 'ReviewModal'

export const ReviewModal = createPolymorphicComponent<typeof Button, ButtonProps>(ReviewModalBody)

export type ReviewModalProps = ButtonProps
