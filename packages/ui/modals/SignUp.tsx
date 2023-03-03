import { openContextModal } from '@mantine/modals'
import { ContextModalProps } from '@mantine/modals/lib/context'

import { ModalTitle, ModalTitleProps } from './ModalTitle'

export const SignUpModalBody = ({ context, id, innerProps }: ContextModalProps<{}>) => {
	return <>Signup flow goes here</>
}

const modalTitle = <ModalTitle breadcrumb={{ option: 'close' }} />

export const openSignUpModal = () =>
	openContextModal({
		modal: 'signup',
		title: modalTitle,
		innerProps: {},
	})

type LoginModalProps = {
	title: ModalTitleProps
}
