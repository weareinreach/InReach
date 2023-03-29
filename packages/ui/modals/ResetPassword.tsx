/* eslint-disable react/no-unescaped-entities */
import {
	Stack,
	Text,
	Title,
	useMantineTheme,
	type ButtonProps,
	Modal,
	Box,
	Popover,
	PasswordInput,
	Progress,
	createPolymorphicComponent,
} from '@mantine/core'
import { UseFormReturnType, useForm, zodResolver } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { decodeUrl } from '@weareinreach/api/lib/encodeUrl'
import { useRouter } from 'next/router'
import { useTranslation, Trans } from 'next-i18next'
import { forwardRef, useState } from 'react'
import { z } from 'zod'

import { Button, Link } from '~ui/components/core'
import { useCustomVariant } from '~ui/hooks'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { LoginModalLauncher } from './Login'
import { ModalTitle } from './ModalTitle'

const isRecord = (data: unknown) => z.record(z.any()).safeParse(data).success
const UrlParams = z.object({ r: z.string(), code: z.string() }).refine((data) => {
	try {
		const obj = decodeUrl(data.r)
		return isRecord(obj)
	} catch (error) {
		console.error(error)
		return false
	}
})

export const FormPassword = ({
	form,
}: {
	form: UseFormReturnType<FormProps, (values: FormProps) => FormProps>
}) => {
	const { t } = useTranslation('common')
	const theme = useMantineTheme()
	type PasswordRequirementProps = {
		meets: boolean
		label: string
	}
	const PasswordRequirement = ({ meets, label }: PasswordRequirementProps) => {
		const { t } = useTranslation('common')
		const theme = useMantineTheme()
		const variants = useCustomVariant()
		return (
			<Text
				variant={variants.Text.utility4}
				color={meets ? theme.other.colors.primary.lightGray : theme.other.colors.tertiary.red}
				sx={{ display: 'flex', alignItems: 'center' }}
				mt={8}
			>
				{meets ? (
					<Icon icon='carbon:checkmark-filled' height={20} color={theme.other.colors.primary.allyGreen} />
				) : (
					<Icon icon='carbon:warning-filled' height={20} color={theme.other.colors.tertiary.red} />
				)}
				<Box ml={10}>{t(label, { ns: 'common' })}</Box>
			</Text>
		)
	}
	const passwordRequirements = [
		{ re: /[0-9]/, label: 'password-req-number' },
		{ re: /[a-z]/, label: 'password-req-lowercase' },
		{ re: /[A-Z]/, label: 'password-req-uppercase' },
		{ re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'password-req-special' },
	]
	const passwordStrength = (password: string) => {
		let multiplier = password.length > 5 ? 0 : 1

		passwordRequirements.forEach((requirement) => {
			if (!requirement.re.test(password)) {
				multiplier += 1
			}
		})

		return Math.max(100 - (100 / (passwordRequirements.length + 1)) * multiplier, 10)
	}
	const pwChecks = passwordRequirements.map((requirement, index) => (
		<PasswordRequirement
			key={index}
			label={requirement.label}
			meets={requirement.re.test(form.values.password)}
		/>
	))
	const pwStrength = passwordStrength(form.values.password)
	const pwMeterColor =
		pwStrength === 100
			? theme.other.colors.primary.allyGreen
			: pwStrength > 50
			? theme.other.colors.tertiary.yellow
			: theme.other.colors.tertiary.red
	const [pwPopover, setPwPopover] = useState(false)

	return (
		<Popover opened={pwPopover} position='bottom' width='target' transitionProps={{ transition: 'pop' }}>
			<Popover.Target>
				<PasswordInput
					required
					label={t('password')}
					placeholder={t('enter-password-placeholder') as string}
					{...form.getInputProps('password')}
					onFocusCapture={() => setPwPopover(true)}
					onBlurCapture={() => setPwPopover(false)}
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

export const ResetPasswordModalBody = forwardRef<HTMLButtonElement, ResetPasswordModalBodyProps>(
	(props, ref) => {
		const { t } = useTranslation(['common'])
		const router = useRouter()
		const autoOpen = Boolean(router.query['r'])
		const variants = useCustomVariant()
		const [success, setSuccess] = useState(false)
		const [error, setError] = useState(!UrlParams.safeParse(router.query).success)
		const FormSchema = z
			.object({
				password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[$&+,:;=?@#|'<>.^*()%!-]).{8,}$/, {
					message: t('form-error-password-req') as string,
				}),
				confirmPassword: z.string(),
			})
			.refine((data) => data.password === data.confirmPassword, {
				message: t('password-error-match') as string,
				path: ['confirmPassword'],
			})
		const DataSchema = z.string().default('')

		const passwordResetForm = useForm<FormProps>({
			validate: zodResolver(FormSchema),
			validateInputOnBlur: true,
			initialValues: {
				data: DataSchema.parse(router.query['r']),
				code: DataSchema.parse(router.query['code']),
				password: '',
				confirmPassword: '',
			},
		})
		const pwResetHandler = api.user.resetPassword.useMutation({
			onSuccess: () => setSuccess(true),
			onError: () => setError(true),
		})

		const [opened, handler] = useDisclosure(autoOpen)

		const modalTitle = <ModalTitle breadcrumb={{ option: 'close', onClick: () => handler.close() }} />

		const bodyReset = (
			<Stack align='center' spacing={24}>
				<Stack spacing={0} align='center'>
					<Title order={1}>🔐</Title>
					<Title order={2}>{t('reset-password')}</Title>
				</Stack>
				<FormPassword form={passwordResetForm} />
				<PasswordInput
					required
					label={t('password-confirm')}
					placeholder={t('password-reenter-placeholder') as string}
					{...passwordResetForm.getInputProps('confirmPassword')}
				/>
				<Button
					onClick={() => pwResetHandler.mutate(passwordResetForm.values)}
					variant='primary-icon'
					fullWidth
					loaderPosition='center'
					loading={pwResetHandler.isLoading}
					disabled={!passwordResetForm.isValid()}
				>
					{t('save')}
				</Button>
			</Stack>
		)

		const bodySuccess = (
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
		)
		const bodyError = (
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
		)

		return (
			<>
				<Modal title={modalTitle} opened={opened} onClose={() => handler.close()}>
					{success ? bodySuccess : error ? bodyError : bodyReset}
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

export interface ResetPasswordModalBodyProps extends ButtonProps {}

type FormProps = {
	data: string
	code: string
	password: string
	confirmPassword: string
}
