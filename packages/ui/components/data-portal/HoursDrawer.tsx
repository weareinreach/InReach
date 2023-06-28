import { Button, type ButtonProps, createPolymorphicComponent, Drawer, Group } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { forwardRef } from 'react'

export const _HoursDrawer = forwardRef<HTMLButtonElement, HoursDrawerProps>((props, ref) => {
	const [opened, { open, close }] = useDisclosure(false)

	return (
		<>
			<Drawer opened={opened} onClose={close} title='Authentication'>
				{/* Drawer content */}
			</Drawer>

			<Group position='center'>
				<Button onClick={open}>Open Drawer</Button>
			</Group>
		</>
	)
})

_HoursDrawer.displayName = 'HoursDrawer'

export const HoursDrawer = createPolymorphicComponent<'button', HoursDrawerProps>(_HoursDrawer)

export interface HoursDrawerProps extends ButtonProps {
	x: string
}
