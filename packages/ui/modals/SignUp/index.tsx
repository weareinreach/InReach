import { Box, type ButtonProps, Checkbox, Divider, Modal, Radio, Stack, Text, Title } from '@mantine/core'
import { zodResolver } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { createPolymorphicComponent } from '@mantine/utils'
import { useRouter } from 'next/router'
import { Trans, useTranslation } from 'next-i18next'
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { type LiteralUnion } from 'type-fest'

import { type ModalTitleBreadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { Link } from '~ui/components/core/Link'
import { useCustomVariant, useScreenSize } from '~ui/hooks'
import { trpc as api } from '~ui/lib/trpcClient'

import { SignUpFormProvider, SignUpSchema, useSignUpForm } from './context'
import {
	FormEmail,
	FormLocation,
	FormName,
	FormPassword,
	FormServiceProvider,
	LanguageSelect,
} from './fields'
import { ForgotPasswordModal } from '../ForgotPassword'
import { LoginModalLauncher } from '../Login'
import { ModalTitle } from '../ModalTitle'
import { PrivacyStatementModal } from '../PrivacyStatement'

type RichTranslateProps = {
	i18nKey: string
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

const LcrQuestion3 = (
	<Trans
		i18nKey='sign-up.lcr-screen3'
		components={{
			Link: (
				<a href='https://inreach.org/become-a-local-community-reviewer/' target='_blank'>
					.
				</a>
			),
		}}
	/>
)

export const SignUpModalBody = forwardRef<HTMLButtonElement, SignUpModalBodyProps>((props, ref) => {
	const { t } = useTranslation('common')
	const { isMobile } = useScreenSize()
	const [opened, handler] = useDisclosure(false)
	const [stepOption, setStepOption] = useState<LiteralUnion<
		'individual' | 'provider' | 'lcr',
		string
	> | null>(null)
	const [successMessage, setSuccessMessage] = useState(false)
	const [userExists, setUserExists] = useState(false)

	const [lcrElig, setLcrElig] = useState<Record<'1' | '2' | '3', boolean | undefined>>({
		1: undefined,
		2: undefined,
		3: undefined,
	})
	const [lcrQ1, setLcrQ1] = useState<string[]>([])
	const [lcrQ2, setLcrQ2] = useState<string>('')
	const [lcrQ3, setLcrQ3] = useState<string>('')
	const lcrNameRef = useRef<HTMLInputElement>(null)

	const variants = useCustomVariant()
	const signUpAction = api.user.create.useMutation({
		onSuccess: () => {
			setSuccessMessage(true)
		},
		onError: (error) => {
			if (error.message === 'User already exists') {
				setUserExists(true)
			}
		},
	})
	const router = useRouter()

	// const SignUpSchema = z.object({
	// 	name: z.string(),
	// 	email: z.string().email({ message: t('form-error-enter-valid-email') as string }),
	// 	password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[$&+,:;=?@#|'<>.^*()%!-]).{8,}$/, {
	// 		message: t('form-error-password-req') as string,
	// 	}),
	// })
	const form = useSignUpForm({
		validate: zodResolver(SignUpSchema),
		initialValues: {
			email: '',
			name: '',
			password: '',
			language: router.locale,
			searchLocation: '',
			locationOptions: [],
			userType: 'individual',
			cognitoSubject: t('confirm-account.subject') satisfies string,
			cognitoMessage: t('confirm-account.message') satisfies string,
		},
		validateInputOnBlur: true,
	})

	const userTypeChange = (step: string | null) => {
		if (!step) return

		setStepOption(step)
		if (step === 'provider') form.setFieldValue('userType', 'provider')
		else if (step === 'lcr') form.setFieldValue('userType', 'lcr')
		else form.setFieldValue('userType', 'individual')
	}

	const breadcrumbProps: ModalTitleBreadcrumb =
		stepOption === null || successMessage
			? { option: 'close', onClick: () => handler.close() }
			: { option: 'back', backTo: 'none', onClick: () => setStepOption(null) }

	const titleRightSideProps = successMessage
		? undefined
		: t('step-x-y', { ns: 'common', x: stepOption ? 2 : 1, y: 2 })
	const modalTitle = <ModalTitle breadcrumb={breadcrumbProps} rightText={titleRightSideProps} />

	const step1 = <RichTranslate i18nKey='sign-up.modal-body' stateSetter={userTypeChange} handler={handler} />

	const submitHandler = () => {
		if (form.isValid()) {
			signUpAction.mutate(form.values)
		}
	}

	const signUpButton = (
		<>
			<Button disabled={!form.isValid()} onClick={submitHandler} loading={signUpAction.isLoading}>
				{t('words.sign-up')}
			</Button>
			<Text variant={variants.Text.utility4darkGray}>
				<Trans
					i18nKey='agree-disclaimer'
					values={{
						action: '$t(words.sign-up)',
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

	useEffect(() => {
		if (lcrQ1.includes('none')) {
			if (lcrQ1.length > 1) {
				setLcrQ1(['none'])
			}
			setLcrElig((prev) => ({ ...prev, 1: false }))
		} else if (lcrQ1.length >= 1 && !lcrQ1.includes('none')) {
			setLcrElig((prev) => ({ ...prev, 1: true }))
		} else if (lcrQ1.length === 0 && lcrElig[1] !== undefined) {
			setLcrElig((prev) => ({ ...prev, 1: undefined }))
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [lcrQ1])

	useEffect(() => {
		if (lcrQ2 === 'none') {
			setLcrElig((prev) => ({ ...prev, 2: false }))
		} else if (['a', 'b', 'c'].includes(lcrQ2)) {
			setLcrElig((prev) => ({ ...prev, 2: true }))
		}
	}, [lcrQ2])
	useEffect(() => {
		if (lcrQ3 === 'false') {
			setLcrElig((prev) => ({ ...prev, 3: false }))
		} else if (lcrQ3 === 'true') {
			setLcrElig((prev) => ({ ...prev, 3: true }))
		}
	}, [lcrQ3])

	const isEligLCR = useMemo(() => Object.values(lcrElig).every((val) => val), [lcrElig])

	useEffect(() => {
		if (isEligLCR) {
			lcrNameRef.current?.scrollIntoView({ behavior: 'smooth' })
		}
	}, [isEligLCR])

	const LcrError = ({ error }: { error: '1' | '2' }) => (
		<Trans
			i18nKey={error === '1' ? 'sign-up.lcr-error1' : 'sign-up.lcr-error2'}
			components={{
				Link: (
					<a href='https://inreach.org/become-a-local-community-reviewer/' target='_blank'>
						.
					</a>
				),
				Switch: (
					<a
						href='#'
						onClick={(e) => {
							e.preventDefault()
							setStepOption('individual')
						}}
					>
						.
					</a>
				),
			}}
		/>
	)

	const step2 = () => {
		switch (stepOption) {
			case 'provider': {
				return (
					<Stack>
						<FormName tContext='full' />
						<FormEmail tContext='professional' />
						<FormPassword />
						<LanguageSelect />
						<FormLocation />
						<FormServiceProvider />
						{/* {lawPractice && <FormLawPractice />} */}
						{signUpButton}
					</Stack>
				)
			}
			case 'lcr': {
				return (
					<Stack>
						<Checkbox.Group
							label={t('sign-up.lcr-screen1')}
							value={lcrQ1}
							onChange={setLcrQ1}
							error={lcrElig[1] === false && <LcrError error='1' />}
							required
						>
							<Checkbox value='a' label={t('sign-up.lcr-screen1a')} />
							<Checkbox value='b' label={t('sign-up.lcr-screen1b')} />
							<Checkbox value='c' label={t('sign-up.lcr-screen1c')} />
							<Checkbox value='none' label={t('sign-up.lcr-screen1none')} />
						</Checkbox.Group>
						<Radio.Group
							label={t('sign-up.lcr-screen2')}
							value={lcrQ2}
							onChange={setLcrQ2}
							error={lcrElig[2] === false && <LcrError error='1' />}
							required
						>
							<Radio value='a' label={t('sign-up.lcr-screen2a')} />
							<Radio value='b' label={t('sign-up.lcr-screen2b')} />
							<Radio value='c' label={t('sign-up.lcr-screen2c')} />
							<Radio value='none' label={t('sign-up.lcr-screen2none')} />
						</Radio.Group>
						<Radio.Group
							label={LcrQuestion3}
							value={lcrQ3}
							onChange={setLcrQ3}
							error={lcrElig[3] === false && <LcrError error='2' />}
							required
						>
							<Radio value='true' label={t('words.yes')} />
							<Radio value='false' label={t('words.no')} />
						</Radio.Group>

						{isEligLCR && (
							<>
								<Divider />
								<FormName tContext='full' ref={lcrNameRef} />
								<FormEmail tContext='professional' />
								<FormPassword />
								<LanguageSelect />
								<FormLocation />
							</>
						)}
						{signUpButton}
					</Stack>
				)
			}
			default: {
				return (
					<Stack>
						<FormName tContext='alias' />
						<FormEmail />
						<FormPassword />
						{signUpButton}
					</Stack>
				)
			}
		}
	}

	const signupBody = (
		<>
			<RichTranslate i18nKey='sign-up.header' handler={handler} />
			{stepOption === null ? step1 : step2()}
		</>
	)

	const successBody = (
		<>
			<Title order={1}>✅</Title>
			<Title order={2}>{t('sign-up.success')}</Title>
			<Text variant={variants.Text.utility1darkGray}>{t('sign-up.verify-email')}</Text>
			<Button variant={variants.Button.primaryLg} fullWidth onClick={() => router.push('/')}>
				{t('find-x', { value: '$t(resources, lowercase)' })}
			</Button>
			{/* <Button variant={variants.Button.primaryLg} fullWidth onClick={() => router.push('/profile')}>
				{t('go-to-x', { value: '$t(profile, lowercase)' })}
			</Button> */}
		</>
	)
	const userExistsBody = (
		<>
			<Title order={1}>🧐</Title>
			<Title order={2}>{t('sign-up.user-exists-header')}</Title>
			<Text variant={variants.Text.utility1darkGray}>{t('sign-up.user-exists-body')}</Text>
			<ForgotPasswordModal component={Link} variant={variants.Button.primaryLg}>
				{t('forgot-password')}
			</ForgotPasswordModal>
		</>
	)

	const modalBody = () => {
		if (successMessage) {
			return successBody
		}
		if (userExists) {
			return userExistsBody
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

type SignUpModalBodyProps = ButtonProps
