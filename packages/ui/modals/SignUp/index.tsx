import { Modal, Box, type ButtonProps, Text, Title, Stack } from '@mantine/core'
import { zodResolver } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { createPolymorphicComponent } from '@mantine/utils'
import { useRouter } from 'next/router'
import { useTranslation, Trans } from 'next-i18next'
import { useState, forwardRef } from 'react'
import { z } from 'zod'

import { Link, Button, ModalTitleBreadcrumb } from '~ui/components/core'
import { useScreenSize, useCustomVariant } from '~ui/hooks'
import { trpc as api } from '~ui/lib/trpcClient'

import { SignUpFormProvider, useSignUpForm } from './context'
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
	stateSetter?: (userType: string | null) => void
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

export const SignUpModalBody = forwardRef<HTMLButtonElement, SignUpModalBodyProps>((props, ref) => {
	const { t } = useTranslation('common')
	const { isMobile } = useScreenSize()
	const [opened, handler] = useDisclosure(false)
	const [stepOption, setStepOption] = useState<string | null>(null)
	const [successMessage, setSuccessMessage] = useState(false)
	const variants = useCustomVariant()
	const signUpAction = api.user.create.useMutation({
		onSuccess: () => {
			setSuccessMessage(true)
		},
	})
	const router = useRouter()

	const SignUpSchema = z.object({
		name: z.string(),
		email: z.string().email({ message: t('form-error-enter-valid-email') as string }),
		password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[$&+,:;=?@#|'<>.^*()%!-]).{8,}$/, {
			message: t('form-error-password-req') as string,
		}),
	})
	const form = useSignUpForm({
		validate: zodResolver(SignUpSchema),
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

	const userTypeChange = (step: string | null) => {
		if (!step) return

		setStepOption(step)
		if (['law', 'servpro'].includes(step)) form.setFieldValue('userType', 'provider')
		else if (step === 'lcr') form.setFieldValue('userType', 'lcr')
		else form.setFieldValue('userType', 'seeker')
	}

	const breadcrumbProps: ModalTitleBreadcrumb =
		stepOption === null || successMessage
			? { option: 'close', onClick: () => handler.close() }
			: { option: 'back', backTo: 'none', onClick: () => setStepOption(null) }

	const titleRightSideProps = successMessage
		? undefined
		: t('step-x-y', { ns: 'common', x: stepOption ? 2 : 1, y: 2 })
	const modalTitle = <ModalTitle breadcrumb={breadcrumbProps} rightText={titleRightSideProps} />

	const step1 = <RichTranslate i18nKey='sign-up-modal-body' stateSetter={userTypeChange} handler={handler} />

	const submitHandler = () => {
		if (form.isValid()) {
			signUpAction.mutate(form.values)
		}
	}

	const signUpButton = (
		<>
			<Button disabled={!form.isValid()} onClick={submitHandler} loading={signUpAction.isLoading}>
				{t('sign-up')}
			</Button>
			<Text variant={variants.Text.utility4darkGray}>
				<Trans
					i18nKey='agree-disclaimer'
					values={{
						action: '$t(sign-up)',
					}}
					components={{
						link1: (
							<PrivacyStatementModal component={Link} key={0} variant={variants.Link.inheritStyle}>
								{t('privacy-policy')}
							</PrivacyStatementModal>
						),
						link2: (
							<Link
								key={1}
								external
								href='https://inreach.org/terms-of-use/'
								variant={variants.Link.inheritStyle}
							>
								Terms of Use
							</Link>
						),
					}}
				/>
			</Text>
		</>
	)

	const step2 = () => {
		let nameContext: 'alias' | 'full' = 'alias'
		let emailContext: 'professional' | 'student-pro' | undefined = undefined
		let langSelect = false
		let location = false
		let lawPractice = false
		let servProvider = false

		switch (stepOption) {
			case 'law': {
				nameContext = 'full'
				emailContext = 'student-pro'
				langSelect = true
				location = true
				lawPractice = true
				break
			}
			case 'servpro': {
				nameContext = 'full'
				emailContext = 'professional'
				langSelect = true
				location = true
				servProvider = true
				break
			}
			case 'lcr': {
				nameContext = 'full'
				langSelect = true
				location = true
			}
		}

		return (
			<Stack>
				<FormName tContext={nameContext} />
				<FormEmail tContext={emailContext} />
				<FormPassword />
				{langSelect && <LanguageSelect />}
				{location && <FormLocation />}
				{lawPractice && <FormLawPractice />}
				{servProvider && <FormServiceProvider />}
				{signUpButton}
			</Stack>
		)
	}

	const signupBody = (
		<>
			<RichTranslate i18nKey='sign-up-header' handler={handler} />
			{stepOption === null ? step1 : step2()}
		</>
	)

	const successBody = (
		<>
			<Title order={1}>✅</Title>
			<Title order={2}>{t('sign-up-success')}</Title>
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
		return signupBody
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
				<SignUpFormProvider form={form}>
					<Stack spacing={24} align='center'>
						{modalBody()}
					</Stack>
				</SignUpFormProvider>
			</Modal>
			<Box component='button' ref={ref} onClick={() => handler.open()} {...props} />
		</>
	)
})

SignUpModalBody.displayName = 'SignupModalBody'

export const SignupModalLauncher = createPolymorphicComponent<'button', SignUpModalBodyProps>(SignUpModalBody)

interface SignUpModalBodyProps extends ButtonProps {}
