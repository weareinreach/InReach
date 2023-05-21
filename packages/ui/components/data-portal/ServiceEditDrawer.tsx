import { type ButtonProps, createPolymorphicComponent } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { forwardRef } from 'react'

const _ServiceEditDrawer = forwardRef<HTMLButtonElement, ServiceEditDrawerProps>((props, ref) => {
	return <div>ServicesDrawer</div>
})
_ServiceEditDrawer.displayName = 'ServiceEditDrawer'

export const ServiceEditDrawer = createPolymorphicComponent<'button', ServiceEditDrawerProps>(
	_ServiceEditDrawer
)

interface ServiceEditDrawerProps extends ButtonProps {
	x?: string
}
