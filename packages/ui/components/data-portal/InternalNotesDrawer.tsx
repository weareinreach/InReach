import { Drawer } from '@mantine/core'
import { useMemo } from 'react'

import { ModalTitle } from '~ui/modals/ModalTitle'

interface InternalNotesDrawerProps {
	opened: boolean
	onClose: () => void
}

export const InternalNotesDrawer: React.FC<InternalNotesDrawerProps> = ({ opened, onClose }) => {
	const drawerTitle = useMemo(
		() => <ModalTitle breadcrumb={{ option: 'close', onClick: onClose }} maxWidth='100%' />,
		[onClose]
	)

	return (
		<Drawer
			opened={opened}
			onClose={onClose}
			position='bottom'
			size='95vh'
			padding='md'
			withCloseButton={false}
			title={drawerTitle}
		>
			Content goes here...
		</Drawer>
	)
}
