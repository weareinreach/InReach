import { Modal, Box, type ButtonProps, Group, Text, Title, Stack } from '@mantine/core'
import { zodResolver } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { createPolymorphicComponent } from '@mantine/utils'
import { useRouter } from 'next/router'
import { useTranslation, Trans } from 'next-i18next'
import { useState, forwardRef, Dispatch, SetStateAction } from 'react'
import { z } from 'zod'

import { Link, Button, ModalTitleBreadcrumb } from '~ui/components/core'
import { useScreenSize, useCustomVariant } from '~ui/hooks'
import { trpc as api } from '~ui/lib/trpcClient'

import { UserSurveyFormProvider, useUserSurveyForm } from './context'
import {
	FormEmail,
	FormName,
	FormPassword,
	LanguageSelect,
	FormLocation,
	FormLawPractice,
	FormServiceProvider,
} from './fields'
import { LoginModalLauncher } from '../Login'
import { ModalTitle } from '../ModalTitle'
import { PrivacyStatementModal } from '../PrivacyStatement'

type RichTranslateProps = {
	i18nKey: string
	values?: Record<string, any>
	stateSetter?: Dispatch<SetStateAction<string | null>>
	handler?: {
		open: () => void
		close: () => void
		toggle: () => void
	}
}
export const RichTranslate = ({ stateSetter, handler, ...props }: RichTranslateProps) => {
	const { t } = useTranslation()
	const variants = useCustomVariant()

	return (
		<Trans
			tOptions={{
				returnObjects: true,
				joinArrays: '',
			}}
			t={t}
			components={{
				emojiLg: <Text fz={40}>.</Text>,
				title2: <Title order={2}>.</Title>,
				title3: (
					<Title order={3} ta='center'>
						.
					</Title>
				),
				textDarkGray: (
					<Text variant={variants.Text.darkGray} ta='center'>
						.
					</Text>
				),
				loginLink: (
					<LoginModalLauncher
						external
						component={Link}
						key={0}
						variant={variants.Link.inheritStyle}
						// onClick={() => handler.close()}
					>
						.
					</LoginModalLauncher>
				),
				button: (
					<Button
						variant='secondary-icon'
						onClick={
							stateSetter ? (e) => stateSetter(e.currentTarget.getAttribute('data-option')) : undefined
						}
					>
						.
					</Button>
				),
				group: <Stack align='center'>.</Stack>,
			}}
			{...props}
		/>
	)
}

export const UserSurveyModalBody = forwardRef<HTMLButtonElement, UserSurveyModalBodyProps>((props, ref) => {
	const { t } = useTranslation('common')
	const { isMobile } = useScreenSize()
	const [opened, handler] = useDisclosure(false)
	const [stepOption, setStepOption] = useState<string | null>('step1')
	const [step, setStep] = useState<number>(1)
	const [successMessage, setSuccessMessage] = useState(false)
	const variants = useCustomVariant()
	const UserSurveyAction = api.user.create.useMutation({
		onSuccess: () => {
			setSuccessMessage(true)
		},
	})
	const router = useRouter()

	const UserSurveySchema = z.object({
		name: z.string(),
		email: z.string().email({ message: t('form-error-enter-valid-email') as string }),
		password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[$&+,:;=?@#|'<>.^*()%!-]).{8,}$/, {
			message: t('form-error-password-req') as string,
		}),
	})
	const form = useUserSurveyForm({
		validate: zodResolver(UserSurveySchema),
		initialValues: {
			email: '',
			name: '',
			password: '',
			language: router.locale,
			searchLocation: '',
			locationOptions: [],
			userType: 'seeker',
			cognitoSubject: t('confirm-account.subject') as string,
			cognitoMessage: t('confirm-account.message') as string,
		},
		validateInputOnBlur: true,
	})

	const breadcrumbProps: ModalTitleBreadcrumb =
		stepOption === null || successMessage
			? { option: 'close', onClick: () => handler.close() }
			: {
					option: 'back',
					backTo: 'none',
					onClick: () => {
						setStep(1)
						setStepOption(null)
					},
			  }

	const titleRightSideProps = successMessage ? undefined : t('step-x-y', { ns: 'common', x: step, y: 5 })
	const modalTitle = <ModalTitle breadcrumb={breadcrumbProps} rightText={titleRightSideProps} />

	// const step1 = <RichTranslate i18nKey='sign-up-modal-body' stateSetter={setStepOption} handler={handler} />
	const step1 = () => {
		return (
			<>
				<Title order={2}>Question title</Title>
				<Text variant={variants.Text.darkGray}>question sub-title</Text>
				<Text>answer options</Text>
				<Group position='center'>
					<Button
						onClick={() => {
							setStepOption('step2')
							setStep(2)
						}}
					>
						Skip
					</Button>
					<Button
						onClick={() => {
							setStepOption('step2')
							setStep(2)
						}}
					>
						Next
					</Button>
				</Group>
			</>
		)
	}

	const step2 = () => {
		return (
			<>
				<Title order={2}>Question title</Title>
				<Text variant={variants.Text.darkGray}>question sub-title</Text>
				<Text>answer options</Text>
				<Group position='center'>
					<Button
						onClick={() => {
							setStepOption('step3')
							setStep(3)
						}}
					>
						Skip
					</Button>
					<Button
						onClick={() => {
							setStepOption('step3')
							setStep(3)
						}}
					>
						Next
					</Button>
				</Group>
			</>
		)
	}

	const step3 = () => {
		return (
			<>
				<Title order={2}>Question title</Title>
				<Text variant={variants.Text.darkGray}>question sub-title</Text>
				<Text>answer options</Text>
				<Group position='center'>
					<Button
						onClick={() => {
							setStepOption('step4')
							setStep(4)
						}}
					>
						Skip
					</Button>
					<Button
						onClick={() => {
							setStepOption('step4')
							setStep(4)
						}}
					>
						Next
					</Button>
				</Group>
			</>
		)
	}

	const step4 = () => {
		return (
			<>
				<Title order={2}>Question title</Title>
				<Text variant={variants.Text.darkGray}>question sub-title</Text>
				<Text>answer options</Text>
				<Group position='center'>
					<Button
						onClick={() => {
							setStepOption('step5')
							setStep(5)
						}}
					>
						Skip
					</Button>
					<Button
						onClick={() => {
							setStepOption('step5')
							setStep(5)
						}}
					>
						Next
					</Button>
				</Group>
			</>
		)
	}

	const step5 = () => {
		return (
			<>
				<Title order={2}>Question title</Title>
				<Text variant={variants.Text.darkGray}>question sub-title</Text>
				<Text>answer options</Text>
				<Group position='center'>
					<Button
						onClick={() => {
							setStepOption('step6')
							setSuccessMessage(true)
						}}
					>
						Skip
					</Button>
					<Button
						onClick={() => {
							setStepOption('step6')
							setSuccessMessage(true)
						}}
					>
						Finish
					</Button>
				</Group>
			</>
		)
	}

	const submitHandler = () => {
		if (form.isValid()) {
			UserSurveyAction.mutate(form.values)
		}
	}

	const UserSurveyButton = (
		<>
			<Button onClick={submitHandler}>Skip</Button>
			<Button onClick={submitHandler}>Next</Button>
			<Button disabled={!form.isValid()} onClick={submitHandler} loading={UserSurveyAction.isLoading}>
				{t('sign-up')}
			</Button>
		</>
	)

	// const step2 = () => {
	// 	let nameContext: 'alias' | 'full' = 'alias'
	// 	let emailContext: 'professional' | 'student-pro' | undefined = undefined
	// 	let langSelect = false
	// 	let location = false
	// 	let lawPractice = false
	// 	let servProvider = false

	// 	switch (stepOption) {
	// 		case 'law': {
	// 			nameContext = 'full'
	// 			emailContext = 'student-pro'
	// 			langSelect = true
	// 			location = true
	// 			lawPractice = true
	// 			form.setFieldValue('userType', 'provider')
	// 			break
	// 		}
	// 		case 'servpro': {
	// 			nameContext = 'full'
	// 			emailContext = 'professional'
	// 			langSelect = true
	// 			location = true
	// 			servProvider = true
	// 			form.setFieldValue('userType', 'provider')
	// 			break
	// 		}
	// 		case 'lcr': {
	// 			nameContext = 'full'
	// 			langSelect = true
	// 			location = true
	// 			form.setFieldValue('userType', 'lcr')
	// 		}
	// 	}

	// 	return (
	// 		<Stack>
	// 			<FormName tContext={nameContext} />
	// 			<FormEmail tContext={emailContext} />
	// 			<FormPassword />
	// 			{langSelect && <LanguageSelect />}
	// 			{location && <FormLocation />}
	// 			{lawPractice && <FormLawPractice />}
	// 			{servProvider && <FormServiceProvider />}
	// 			{UserSurveyButton}
	// 		</Stack>
	// 	)
	// }

	const getQuestion = (q: any) => {
		switch (q) {
			case 'step1': {
				return step1()
			}
			case 'step2': {
				return step2()
			}
			case 'step3': {
				return step3()
			}
			case 'step4': {
				return step4()
			}
			case 'step5': {
				return step5()
			}
			default:
				return step1()
		}
	}
	const UserSurveyBody = (
		<>
			{/* <RichTranslate i18nKey='sign-up-header' handler={handler} /> */}
			{/* {stepOption === 'step1' ? step1() : step2()} */}
			{getQuestion(stepOption)}
		</>
	)

	const successBody = (
		<>
			<Title order={1}>🎉</Title>
			<Title order={2}>{t('survey.thank-you')}</Title>
			<Text variant={variants.Text.darkGray}>{t('survey.thank-you-message')}</Text>
			<Button variant={variants.Button.primaryLg} fullWidth onClick={() => router.push('/')}>
				{t('find-x', { value: '$t(resources, lowercase)' })}
			</Button>
			<Button variant={variants.Button.primaryLg} fullWidth onClick={() => router.push('/profile')}>
				{t('go-to-x', { value: '$t(profile, lowercase)' })}
			</Button>
		</>
	)

	const modalBody = () => {
		if (successMessage) {
			return successBody
		}
		return UserSurveyBody
	}

	return (
		<>
			<Modal
				title={modalTitle}
				scrollAreaComponent={Modal.NativeScrollArea}
				opened={opened}
				onClose={() => handler.close()}
				fullScreen={isMobile}
				zIndex={500}
			>
				<UserSurveyFormProvider form={form}>
					<Stack spacing={24} align='center'>
						{modalBody()}
					</Stack>
				</UserSurveyFormProvider>
			</Modal>
			<Box component='button' ref={ref} onClick={() => handler.open()} {...props} />
		</>
	)
})

UserSurveyModalBody.displayName = 'UserSurveyModalBody'

export const UserSurveyModalLauncher = createPolymorphicComponent<'button', UserSurveyModalBodyProps>(
	UserSurveyModalBody
)

interface UserSurveyModalBodyProps extends ButtonProps {}
