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
import { modals } from '@mantine/modals'
import { useTranslation, Trans } from 'next-i18next'
import { forwardRef, useState } from 'react'
import { string } from 'zod'

import { Button, Link } from '~ui/components/core'
import { useCustomVariant } from '~ui/hooks'

import { ModalTitle } from './ModalTitle'
import { PrivacyStatementModal } from './PrivacyStatement'
import { PrimaryDisabled } from '../components/core/Button.stories'

export const UserSurveyModalBody = forwardRef<HTMLButtonElement, UserSurveyModalBodyProps>((props, ref) => {
	const { t } = useTranslation(['common'])
	const variants = useCustomVariant()
	const [opened, handler] = useDisclosure(false)

	const modalTitle = <ModalTitle breadcrumb={{ option: 'close', onClick: () => modals.closeAll() }} />

	const createModalTitleXY = (step: number) => (
		<ModalTitle
			breadcrumb={{ option: 'close', onClick: () => modals.closeAll() }}
			rightText={t('step-x-y', { ns: 'common', x: step, y: 5 })}
		/>
	)

	const labels = { confirm: `${t('words.next')}`, cancel: `${t('back')}` }

	const userSurveyStartPage = (
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
	)

	const question1 = <Text size='sm'>user survey first question goes here</Text>
	const question2 = <Text size='sm'>user survey second question goes here</Text>
	const question3 = <Text size='sm'>user survey third question goes here</Text>
	const question4 = <Text size='sm'>user survey fourth question goes here</Text>
	const question5 = <Text size='sm'>user survey fifth question goes here</Text>
	const thankYou = <Text size='sm'>user survey thank you page goes here</Text>

	return (
		<>
			<Group position='center'>
				{/* This button opens the survey modal */}
				<Button
					onClick={() =>
						modals.openConfirmModal({
							title: modalTitle,
							closeOnConfirm: false,
							labels: { confirm: 'Start Survey', cancel: 'Not Now' },
							children: userSurveyStartPage,
							onConfirm: () =>
								modals.openConfirmModal({
									title: createModalTitleXY(1),
									labels: { confirm: `${t('words.next')}`, cancel: '' },
									closeOnConfirm: false,
									cancelProps: { style: { display: 'none' } },
									children: question1,
									onConfirm: () =>
										modals.openConfirmModal({
											title: createModalTitleXY(2),
											labels: labels,
											closeOnConfirm: false,
											children: question2,
											onConfirm: () =>
												modals.openConfirmModal({
													title: createModalTitleXY(3),
													labels: labels,
													closeOnConfirm: false,
													children: question3,
													onConfirm: () =>
														modals.openConfirmModal({
															title: createModalTitleXY(4),
															labels: labels,
															closeOnConfirm: false,
															children: question4,
															onConfirm: () =>
																modals.openConfirmModal({
																	title: createModalTitleXY(5),
																	labels: labels,
																	closeOnConfirm: false,
																	children: question5,
																	onConfirm: () =>
																		modals.openConfirmModal({
																			title: modalTitle,
																			labels: { confirm: 'Go to Profile', cancel: 'Go to Search' },
																			children: thankYou,
																			onConfirm: modals.closeAll,
																			onCancel: modals.closeAll,
																		}),
																}),
														}),
												}),
										}),
								}),
							onCancel: modals.closeAll,
						})
					}
				>
					Open User Survey Modal
				</Button>
			</Group>
			{/* <Box component='button' ref={ref} onClick={() => handler.open()} {...props} /> */}
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
