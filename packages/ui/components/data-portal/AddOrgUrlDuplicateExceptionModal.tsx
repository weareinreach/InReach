import { Box, Modal } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { forwardRef } from 'react'

import { Button, type ButtonProps } from '~ui/components/core/Button'

import { OrgUrlDuplicateExceptionForm } from './OrgUrlDuplicateExceptionForm'

/**
 * Standalone trigger for the "Add Base URL" flow - rendered via `PageHeading`'s action slot, same placement
 * as `AddOrgModal` on the Organizations page.
 */
export const AddOrgUrlDuplicateExceptionModal = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
	const [opened, handler] = useDisclosure(false)

	return (
		<>
			<Modal opened={opened} onClose={handler.close} title='Add Base URL Exception'>
				<OrgUrlDuplicateExceptionForm onSettled={handler.close} />
			</Modal>
			<Box component={Button} onClick={handler.open} ref={ref} {...props} />
		</>
	)
})
AddOrgUrlDuplicateExceptionModal.displayName = 'AddOrgUrlDuplicateExceptionModal'
