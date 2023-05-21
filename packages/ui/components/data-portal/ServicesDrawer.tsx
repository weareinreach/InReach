import { type ButtonProps, createPolymorphicComponent } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { forwardRef } from 'react'

const _ServicesDrawer = forwardRef<HTMLButtonElement, ServicesDrawerProps>((props, ref) => {
	return <div>ServicesDrawer</div>
})
_ServicesDrawer.displayName = 'ServicesDrawer'

export const ServicesDrawer = createPolymorphicComponent<'button', ServicesDrawerProps>(_ServicesDrawer)

interface ServicesDrawerProps extends ButtonProps {
	x?: string
}
