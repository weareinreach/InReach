import { Text, createStyles, rem } from '@mantine/core'
import { openContextModal } from '@mantine/modals'
import { ContextModalProps } from '@mantine/modals/lib/context'
import { useTranslation } from 'next-i18next'

import { ModalTitle, ModalTitleProps } from './ModalTitle'
import { UserReviewSubmit } from '../components/core/UserReviewSubmit'

const useStyles = createStyles((theme) => ({}))

export const ReviewModalBody = ({ context, id, innerProps }: ContextModalProps<{}>) => {
	const { t } = useTranslation(['common'])
	const { classes } = useStyles()

	return <UserReviewSubmit />
}

const modalTitle = <ModalTitle breadcrumb={{ option: 'close' }} />

export const openReviewModal = () =>
	openContextModal({
		modal: 'review',
		title: modalTitle,
		innerProps: {},
	})

type ReviewModalProps = {
	title: ModalTitleProps
}
