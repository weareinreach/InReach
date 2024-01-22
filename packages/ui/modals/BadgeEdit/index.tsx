import { createPolymorphicComponent } from '@mantine/core'
import { forwardRef } from 'react'

const _BadgeEditModal = forwardRef<HTMLButtonElement, Props>(({ orgId }, ref) => {
	return <></>
})
_BadgeEditModal.displayName = 'BadgeEditModal'

export const BadgeEditModal = createPolymorphicComponent<'button', Props>(_BadgeEditModal)

interface Props {
	orgId: string
}
