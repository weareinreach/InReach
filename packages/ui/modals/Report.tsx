import { Box, createPolymorphicComponent, Group, Modal, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { forwardRef, type MouseEventHandler } from 'react'

import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button, type ButtonProps } from '~ui/components/core/Button'
import { ReportSubmit } from '~ui/components/core/ReportSubmit'
import { useScreenSize } from '~ui/hooks/useScreenSize'

const ReportModalBody = forwardRef<HTMLButtonElement, ReportModalProps>(
	({ itemId, itemName, component, closeMenuOnClick, ...props }, ref) => {
		const [opened, handler] = useDisclosure(false)
		const { isMobile } = useScreenSize()
		const modalTitle = (
			<Group spacing='sm' noWrap>
				<Breadcrumb onClick={handler.close} option='close' />
			</Group>
		)

		return (
			<>
				<Modal
					title={modalTitle}
					opened={opened}
					onClose={handler.close}
					fullScreen={isMobile}
					returnFocus={false}
					trapFocus={true}
					closeOnClickOutside={false}
				>
					<ReportSubmit type='modal' closeModalHandler={handler.close} itemId={itemId} itemName={itemName} />
				</Modal>
				<Box
					component={component || Button}
					ref={ref}
					{...props}
					// Ensure we don't accidentally pass a 'false' that blocks the menu close
					closeMenuOnClick={closeMenuOnClick}
					onClick={(event: React.MouseEvent) => {
						// 1. If there's an onClick passed from the parent (like Mantine Menu), run it
						props.onClick?.(event)

						// 2. Open the modal!
						// We use a small timeout to let the Menu's "closing" state finish
						// so it doesn't fight the Modal for focus.
						setTimeout(() => {
							handler.open()
						}, 50)
					}}
				/>
			</>
		)
	}
)

ReportModalBody.displayName = 'ReportModal'

export const ReportModal = createPolymorphicComponent<typeof Button, ReportModalProps>(ReportModalBody)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ReportModalProps = Omit<ButtonProps, 'variant'> & {
	variant?: ButtonProps['variant'] | (string & NonNullable<unknown>)
	itemId: string
	itemName: string
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	component?: any
	closeMenuOnClick?: boolean
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onClick?: MouseEventHandler<any>
}
