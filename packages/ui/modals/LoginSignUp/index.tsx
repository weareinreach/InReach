import {
	Box,
	type ButtonProps,
	Checkbox,
	createPolymorphicComponent,
	Divider,
	Modal,
	PasswordInput,
	Radio,
	Stack,
	Text,
	TextInput,
	Title,
} from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react'
import { Trans, useTranslation } from 'next-i18next/pages'
import { type Route } from 'nextjs-routes'
import { forwardRef, type MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type LiteralUnion } from 'type-fest'
import { z } from 'zod'

import { userEvent } from '@weareinreach/analytics/events'
import { type ModalTitleBreadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { Link } from '~ui/components/core/Link'
import { useCustomVariant, useScreenSize, useShake } from '~ui/hooks'
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
import { ModalTitle } from '../ModalTitle'
import { PrivacyStatementModal } from '../PrivacyStatement'
import { TroubleLoggingInModal } from '../TroubleLoggingIn'

// #region Signup
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
const RichTranslate = ({ stateSetter, handler, ...props }: RichTranslateProps) => {
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
							stateSetter
								? (e: MouseEvent<HTMLButtonElement>) => stateSetter(e.currentTarget.dataset.option ?? null)
								: undefined
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
				<a href='https://inreach.org/become-a-local-community-reviewer/' target='_blank' rel='noreferrer'>
					.
				</a>
			),
		}}
	/>
)

const SignUpModalBody = forwardRef<HTMLButtonElement, SignUpModalBodyProps>((props, ref) => {
	const { t } = useTranslation('common')
	const { isMobile } = useScreenSize()
	const [opened, handler] = useDisclosure(false)
	const [stepOption, setStepOption] = useState<LiteralUnion<
		'individual' | 'provider' | 'lcr',
		string
	> | null>(null)
	const [successMessage, setSuccessMessage] = useState(false)

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
		// The mutation always resolves the same way whether or not the email already had an account - see
		// mutation.create.handler.ts - so this is always the "check your email" confirmation, never a
		// distinct "this email is taken" state.
		onSuccess: (_data, variables) => {
			userEvent.signup(variables.userType)
			setSuccessMessage(true)
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
		validate: schemaResolver(SignUpSchema, { sync: true }),
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
			// Seeded even though these fields only render conditionally (after picking "other") -
			// otherwise their TextInputs start uncontrolled and trip React's warning once revealed.
			otherLawPractice: '',
			servProviderOther: '',
		},
		validateInputOnBlur: true,
	})

	const userTypeChange = (step: string | null) => {
		if (!step) {
			return
		}

		setStepOption(step)
		if (step === 'provider') {
			form.setFieldValue('userType', 'provider')
		} else if (step === 'lcr') {
			form.setFieldValue('userType', 'lcr')
		} else {
			form.setFieldValue('userType', 'individual')
		}
	}

	const breadcrumbProps: ModalTitleBreadcrumb =
		stepOption === null || successMessage
			? { option: 'close', onClick: handler.close }
			: { option: 'back', backTo: 'none', onClick: () => setStepOption(null) }

	const titleRightSideProps = successMessage
		? undefined
		: t('step-x-y', { ns: 'common', x: stepOption ? 2 : 1, y: 2 })
	const modalTitle = <ModalTitle breadcrumb={breadcrumbProps} rightText={titleRightSideProps} />

	const step1 = (
		<RichTranslate i18nKey='sign-up.modal-body-temp' stateSetter={userTypeChange} handler={handler} />
	)

	const submitHandler = useCallback(() => {
		if (form.isValid()) {
			signUpAction.mutate(form.values)
		}
	}, [form, signUpAction])

	const signUpButton = (
		<>
			<Button disabled={!form.isValid()} onClick={submitHandler} loading={signUpAction.isPending}>
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
					<a href='https://inreach.org/become-a-local-community-reviewer/' target='_blank' rel='noreferrer'>
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
				opened={opened}
				onClose={() => handler.close()}
				fullScreen={isMobile}
				zIndex={500}
			>
				<SignUpFormProvider form={form}>
					<Stack gap={24} align='center'>
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
// #endregion

// #region Login
interface LoginBodyProps {
	activateShake?: () => void
	modalHandler?: {
		readonly open: () => void
		readonly close: () => void
		readonly toggle: () => void
	}
	hideTitle?: boolean
	callbackUrl?: Route
}
export const LoginBody = forwardRef<HTMLDivElement, LoginBodyProps>(
	({ activateShake, modalHandler, hideTitle, callbackUrl }, ref) => {
		const [isLoading, setLoading] = useState(false)
		// Set when `signIn` comes back with Cognito's NEW_PASSWORD_REQUIRED challenge - a staff-set
		// temporary password (see UserTable's "Set Temporary Password" action) rather than a normal
		// failure. The password just typed above *was* the temporary one; it's needed again to complete
		// the challenge (see `completeNewPasswordChallenge`), so it's captured here rather than re-asked.
		const [newPasswordChallenge, setNewPasswordChallenge] = useState<{
			email: string
			temporaryPassword: string
		} | null>(null)
		const variants = useCustomVariant()
		const { t } = useTranslation(['common'])
		const router = useRouter()
		const completeNewPasswordChallenge = api.user.completeNewPasswordChallenge.useMutation()
		const loginErrors = new Map([[401, t('login.error-username-password')]])
		const LoginSchema = z.object({
			email: z.string().email({ message: t('form-error-enter-valid-email') }),
			password: z.string().min(1, t('form-error-password-blank')),
		})
		const form = useForm<LoginFormProps>({
			validate: schemaResolver(LoginSchema, { sync: true }),
			validateInputOnBlur: true,
			// Without this, email/password start `undefined` and their inputs render uncontrolled
			// until typed into, tripping React's uncontrolled-to-controlled input warning.
			initialValues: { email: '', password: '' },
		})
		const NewPasswordSchema = z.object({
			// Same policy as sign-up's password field (context.ts's SignUpSchema) - this is setting a real
			// account password subject to the identical Cognito requirements.
			newPassword: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[$&+,:;=?@#|'<>.^*()%!-]).{8,}$/, {
				message: t('form-error-password-req'),
			}),
		})
		const newPasswordForm = useForm<{ newPassword: string }>({
			validate: schemaResolver(NewPasswordSchema, { sync: true }),
			validateInputOnBlur: true,
			initialValues: { newPassword: '' },
		})
		const completeSignIn = useCallback(
			async (email: string, password: string) => {
				const result = await signIn('cognito', { email, password, redirect: false })
				if (result?.ok) {
					userEvent.login()
					// Falls back to the normal login view rather than leaving the "set new password" step
					// stuck on screen, for the rarer non-modal case (no modalHandler/callbackUrl to navigate
					// away via).
					setNewPasswordChallenge(null)
					if (modalHandler) {
						modalHandler.close()
					} else if (callbackUrl) {
						void router.push(callbackUrl)
					}
				}
				return result
			},
			[modalHandler, callbackUrl, router]
		)
		const loginHandle = async (email: string, password: string) => {
			try {
				setLoading(true)
				if (!form.isValid()) {
					return
				}
				const result = await signIn('cognito', { email, password, redirect: false })
				if (result?.error) {
					// Deliberately no special case for an unconfirmed account here (unlike NewPasswordRequired/
					// TooManyRequests below, neither of which reveal anything about account existence) - showing
					// a distinct message for "this account isn't confirmed" let an anonymous caller enumerate
					// account state, the same thing resendCode/forgotPassword/troubleLoggingIn are built to avoid.
					// Falls through to the generic message below instead; the always-visible "Trouble logging
					// in?" link (troubleLoggingIn, already enumeration-safe) is the actual fix for this case.
					if (result.error === 'NewPasswordRequired') {
						setNewPasswordChallenge({ email, temporaryPassword: password })
					} else if (result.error === 'TooManyRequests') {
						form.setFieldError('password', t('login.error-too-many-attempts'))
					} else {
						const message = loginErrors.get(result.status)
						form.setFieldError('password', message ?? t('login.error-generic'))
					}
					if (typeof activateShake === 'function') {
						activateShake()
					}
				}
				if (result?.ok) {
					userEvent.login()
					if (modalHandler) {
						modalHandler.close()
					} else if (callbackUrl) {
						void router.push(callbackUrl)
					}
				}
			} finally {
				setLoading(false)
			}
		}
		const submitNewPassword = useCallback(
			async (newPassword: string) => {
				if (!newPasswordChallenge || !newPasswordForm.isValid()) {
					return
				}
				try {
					setLoading(true)
					await completeNewPasswordChallenge.mutateAsync({
						email: newPasswordChallenge.email,
						temporaryPassword: newPasswordChallenge.temporaryPassword,
						newPassword,
					})
					const result = await completeSignIn(newPasswordChallenge.email, newPassword)
					if (result?.error) {
						newPasswordForm.setFieldError('newPassword', t('login.new-password-error'))
					}
				} catch {
					newPasswordForm.setFieldError('newPassword', t('login.new-password-error'))
				} finally {
					setLoading(false)
				}
			},
			[newPasswordChallenge, newPasswordForm, completeNewPasswordChallenge, completeSignIn, t]
		)
		const handleSubmitNewPassword = useCallback(() => {
			void submitNewPassword(newPasswordForm.values.newPassword)
		}, [submitNewPassword, newPasswordForm.values.newPassword])
		if (newPasswordChallenge) {
			return (
				<Stack align='center' gap={24} ref={ref}>
					{hideTitle ? null : <Title order={2}>{t('login.new-password-title')}</Title>}
					<Text variant={variants.Text.utility1darkGray}>{t('login.new-password-message')}</Text>
					<PasswordInput
						label={t('login.new-password-label')}
						placeholder={t('enter-password-placeholder')}
						required
						{...newPasswordForm.getInputProps('newPassword')}
					/>
					<Button
						onClick={handleSubmitNewPassword}
						variant='primary-icon'
						fullWidth
						type='submit'
						loading={isLoading}
					>
						{t('login.new-password-submit')}
					</Button>
				</Stack>
			)
		}
		return (
			<Stack align='center' gap={24} ref={ref}>
				{hideTitle ? null : <Title order={2}>{t('log-in')}</Title>}
				<TextInput
					label={t('words.email')}
					placeholder={t('enter-email-placeholder')}
					required
					{...form.getInputProps('email')}
				/>
				<PasswordInput
					label={t('words.password')}
					placeholder={t('enter-password-placeholder')}
					required
					{...form.getInputProps('password')}
				/>
				<Button
					onClick={async () => await loginHandle(form.values.email, form.values.password)}
					variant='primary-icon'
					fullWidth
					type='submit'
					loading={isLoading}
				>
					{t('log-in')}
				</Button>
				<Text variant={variants.Text.utility4darkGray}>
					<Trans
						i18nKey='agree-disclaimer'
						values={{
							action: '$t(log-in)',
						}}
						components={{
							link1: (
								<PrivacyStatementModal component={Link} key={0} variant={variants.Link.inheritStyle}>
									Privacy Policy
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
				<Stack gap={0} align='center'>
					<TroubleLoggingInModal component={Link}>{t('trouble-logging-in')}</TroubleLoggingInModal>
					<SignupModalLauncher component={Link}>{t('dont-have-account')}</SignupModalLauncher>
				</Stack>
			</Stack>
		)
	}
)
LoginBody.displayName = 'LoginBody'

export const LoginModalBody = forwardRef<HTMLButtonElement, LoginModalBodyProps>((props, ref) => {
	const [opened, handler] = useDisclosure(false)
	const { animateStyle, fireEvent } = useShake({ variant: 1 })
	const { isMobile } = useScreenSize()
	const modalTitle = <ModalTitle breadcrumb={{ option: 'close', onClick: handler.close }} />
	return (
		<>
			<Modal
				title={modalTitle}
				opened={opened}
				onClose={() => handler.close()}
				style={animateStyle}
				fullScreen={isMobile}
			>
				<LoginBody modalHandler={handler} activateShake={fireEvent} />
			</Modal>
			<Box component='button' ref={ref} onClick={() => handler.open()} {...props} />
		</>
	)
})

LoginModalBody.displayName = 'LoginModal'

export const LoginModalLauncher = createPolymorphicComponent<'button', LoginModalBodyProps>(LoginModalBody)

export type LoginModalBodyProps = ButtonProps

type LoginFormProps = {
	email: string
	password: string
}

// #endregion
