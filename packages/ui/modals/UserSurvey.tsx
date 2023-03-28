import {
	Text,
	Title,
	Stack,
	Modal,
	Box,
	Group,
	type ButtonProps,
	createPolymorphicComponent,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useTranslation, Trans } from 'next-i18next'
import { forwardRef, useState } from 'react'

import { Button, Link } from '~ui/components/core'
import { useCustomVariant } from '~ui/hooks'

import { ModalTitle } from './ModalTitle'
import { PrivacyStatementModal } from './PrivacyStatement'

export const UserSurveyModalBody = forwardRef<HTMLButtonElement, UserSurveyModalBodyProps>((props, ref) => {
	const { t } = useTranslation(['common'])
	const variants = useCustomVariant()
	const [opened, handler] = useDisclosure(false)

	const modalTitle = <ModalTitle breadcrumb={{ option: 'close', onClick: () => handler.close() }} />

	return (
		<>
			<Modal title={modalTitle} opened={opened} onClose={() => handler.close()}>
				<Stack align='center' spacing={24}>
					<Stack align='center' spacing={16}>
						<Trans
							i18nKey='user-survey-heading'
							components={{
								emojiLg: <Text fz={40}>.</Text>,
								title: <Title>.</Title>,
								textDarkGray: <Text variant={variants.Text.darkGray}>.</Text>,
							}}
						/>
					</Stack>
					<Stack align='center' spacing={14}>
						<Trans
							i18nKey='user-survey-body'
							components={{
								textUtility1: <Text variant={variants.Text.utility1}>.</Text>,
							}}
						/>
					</Stack>
					<PrivacyStatementModal component={Link}>{t('privacy-policy')}</PrivacyStatementModal>
				</Stack>
				<Group>
					<Button>Not Right Now</Button>
					<Button>Start Survey</Button>
				</Group>
			</Modal>
			<Box component='button' ref={ref} onClick={() => handler.open()} {...props} />
		</>
	)
})

UserSurveyModalBody.displayName = 'UserSurveyModal'

export const UserSurveyModalLauncher = createPolymorphicComponent<'button', UserSurveyModalBodyProps>(
	UserSurveyModalBody
)

export interface UserSurveyModalBodyProps extends ButtonProps {}

type UserSurveyFormProps = {
	email: string
	password: string
}
