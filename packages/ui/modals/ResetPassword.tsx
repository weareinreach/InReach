import {
	Box,
	type ButtonProps,
	createPolymorphicComponent,
	createStyles,
	Modal,
	PasswordInput,
	Popover,
	Progress,
	Stack,
	Text,
	Title,
	useMantineTheme,
} from '@mantine/core'
import { useForm, type UseFormReturnType, zodResolver } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { useRouter } from 'next/router'
import { Trans, useTranslation } from 'next-i18next'
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react'
import { z } from 'zod'

import { Button } from '~ui/components/core/Button'
import { Link } from '~ui/components/core/Link'
import { useCustomVariant, useScreenSize } from '~ui/hooks'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { LoginModalLauncher } from './LoginSignUp'
import { ModalTitle } from './ModalTitle'

const usePasswordRequirementStyles = createStyles(() => ({
	text: {
		display: 'flex',
		alignItems: 'center',
	},
}))

const PasswordRequirement = ({ meets, label }: PasswordRequirementProps) => {
	const { t } = useTranslation('common')
	const theme = useMantineTheme()
	const variants = useCustomVariant()
	const { classes } = usePasswordRequirementStyles()
	const textColor = useMemo(
		() => (meets ? theme.other.colors.primary.lightGray : theme.other.colors.tertiary.red),
		[meets, theme]
	)
	const iconToDisplay = useMemo(
		() =>
			meets ? (
				<Icon icon='carbon:checkmark-filled' height={20} color={theme.other.colors.primary.allyGreen} />
			) : (
				<Icon icon='carbon:warning-filled' height={20} color={theme.other.colors.tertiary.red} />
			),
		[meets, theme]
	)

	return (
		<Text variant={variants.Text.utility4} color={textColor} className={classes.text} mt={8}>
			{iconToDisplay}
			<Box ml={10}>{t(label, { ns: 'common' })}</Box>
		</Text>
	)
}
interface PasswordRequirementProps {
	meets: boolean
	label: string
}

const FormPassword = ({ form }: { form: UseFormReturnType<FormProps, (values: FormProps) => FormProps> }) => {
	const { t } = useTranslation('common')
	const theme = useMantineTheme()

	const passwordRequirements = useMemo(
		() => [
			{ re: /\d/, label: 'password-req-number' },
			{ re: /[a-z]/, label: 'password-req-lowercase' },
			{ re: /[A-Z]/, label: 'password-req-uppercase' },
			{ re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'password-req-special' },
		],
		[]
	)
	const passwordStrength = (password: string) => {
		let multiplier = password.length > 5 ? 0 : 1

		passwordRequirements.forEach((requirement) => {
			if (!requirement.re.test(password)) {
				multiplier += 1
			}
		})

		return Math.max(100 - (100 / (passwordRequirements.length + 1)) * multiplier, 10)
	}
	const pwChecks = passwordRequirements.map((requirement) => (
		<PasswordRequirement
			key={requirement.label}
			label={requirement.label}
			meets={requirement.re.test(form.values.password)}
		/>
	))
	const pwStrength = passwordStrength(form.values.password)

	const pwMeterColor = useMemo(() => {
		if (pwStrength === 100) {
			return theme.other.colors.primary.allyGreen
		}
		if (pwStrength > 50) {
			return theme.other.colors.tertiary.yellow
		}
		return theme.other.colors.tertiary.red
	}, [pwStrength, theme])
	const [popoverOpen, popoverHandler] = useDisclosure(false)

	return (
		<Popover opened={popoverOpen} position='bottom' width='target' transitionProps={{ transition: 'pop' }}>
			<Popover.Target>
				<PasswordInput
					required
					label={t('password')}
					placeholder={t('enter-password-placeholder')}
					{...form.getInputProps('password')}
					onFocusCapture={popoverHandler.open}
					onBlurCapture={popoverHandler.close}
				/>
			</Popover.Target>
			<Popover.Dropdown>
				<Progress color={pwMeterColor} value={pwStrength} size={5} mb='xs' />
				<PasswordRequirement label='password-req-length' meets={form.values.password.length >= 8} />
				{pwChecks}
			</Popover.Dropdown>
		</Popover>
	)
}

const ResetPasswordModalBody = forwardRef<HTMLButtonElement, ResetPasswordModalBodyProps>(
	(/*props, ref*/) => {
		const { t } = useTranslation(['common'])
		const router = useRouter()
		const autoOpen = Boolean(router.query['r'])
		const variants = useCustomVariant()
		const [success, setSuccess] = useState(false)
		const [error, setError] = useState(false)
		const { isMobile } = useScreenSize()
		const FormSchema = z
			.object({
				password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[$&+,:;=?@#|'<>.^*()%!-]).{8,}$/, {
					message: t('form-error-password-req'),
				}),
				confirmPassword: z.string(),
			})
			.refine((data) => data.password === data.confirmPassword, {
				message: t('password-error-match'),
				path: ['confirmPassword'],
			})
		const DataSchema = z.object({ r: z.string(), code: z.string() })

		const passwordResetForm = useForm<FormProps>({
			validate: zodResolver(FormSchema),
			validateInputOnBlur: true,
			initialValues: {
				data: '',
				code: '',
				password: '',
				confirmPassword: '',
			},
		})
		const pwResetHandler = api.user.resetPassword.useMutation({
			onSuccess: () => setSuccess(true),
			onError: () => setError(true),
		})

		const [opened, handler] = useDisclosure(autoOpen)
		useEffect(() => {
			const parsedParams = DataSchema.safeParse(router.query)
			if (router.query.r !== undefined && parsedParams.success) {
				passwordResetForm.setValues({ data: parsedParams.data.r, code: parsedParams.data.code })
				handler.open()
			}
		}, [DataSchema, handler, passwordResetForm, router.query, router.query.r])

		const modalTitle = useMemo(
			() => <ModalTitle breadcrumb={{ option: 'close', onClick: handler.close }} />,
			[handler]
		)

		const handlePwResetSubmit = useCallback(() => {
			const values = passwordResetForm.getTransformedValues()
			pwResetHandler.mutate(values)
		}, [passwordResetForm, pwResetHandler])

		const bodyReset = useMemo(
			() => (
				<Stack align='center' spacing={24}>
					<Stack spacing={0} align='center'>
						<Title order={1}>🔐</Title>
						<Title order={2}>{t('reset-password')}</Title>
					</Stack>
					<FormPassword form={passwordResetForm} />
					<PasswordInput
						required
						label={t('password-confirm')}
						placeholder={t('password-reenter-placeholder')}
						{...passwordResetForm.getInputProps('confirmPassword')}
					/>
					<Button
						onClick={handlePwResetSubmit}
						variant='primary-icon'
						fullWidth
						loaderPosition='center'
						loading={pwResetHandler.isLoading}
						disabled={!passwordResetForm.isValid()}
					>
						{t('save')}
					</Button>
				</Stack>
			),
			[t, passwordResetForm, pwResetHandler, handlePwResetSubmit]
		)

		const bodySuccess = useMemo(
			() => (
				<Stack align='center' spacing={24}>
					<Stack spacing={0} align='center'>
						<Title order={1}>✅</Title>
						<Title order={2}>{t('password-saved')}</Title>
					</Stack>
					<Trans
						i18nKey='password-reset-success'
						components={{
							LoginModal: (
								<LoginModalLauncher component={Link} key={0} variant={variants.Link.inheritStyle}>
									.
								</LoginModalLauncher>
							),
							Text: <Text variant={variants.Text.utility1darkGray}>.</Text>,
						}}
					/>
				</Stack>
			),
			[t, variants]
		)
		const bodyError = useMemo(
			() => (
				<Stack align='center' spacing={24}>
					<Stack spacing={0} align='center'>
						<Title order={1}>🫣</Title>
						<Title order={2}>{t('errors.oh-no')}</Title>
					</Stack>
					<Trans
						i18nKey='errors.try-again-text'
						components={{
							Text: <Text variant={variants.Text.utility1darkGray}>.</Text>,
						}}
					/>
				</Stack>
			),
			[variants, t]
		)

		const renderBody = useMemo(() => {
			if (success) {
				return bodySuccess
			}
			if (error) {
				return bodyError
			}
			return bodyReset
		}, [bodyError, bodyReset, bodySuccess, error, success])

		return (
			<>
				<Modal title={modalTitle} opened={opened} onClose={handler.close} fullScreen={isMobile}>
					{renderBody}
				</Modal>
				{/* <Box component='button' ref={ref} onClick={() => handler.open()} {...props} /> */}
			</>
		)
	}
)

ResetPasswordModalBody.displayName = 'ResetPasswordModal'

export const ResetPasswordModal = createPolymorphicComponent<'button', ResetPasswordModalBodyProps>(
	ResetPasswordModalBody
)

export type ResetPasswordModalBodyProps = ButtonProps

type FormProps = {
	data: string
	code: string
	password: string
	confirmPassword: string
}
