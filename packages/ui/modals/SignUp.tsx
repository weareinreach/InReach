import {
	Modal,
	Box,
	type ButtonProps,
	Text,
	Title,
	Stack,
	useMantineTheme,
	TextInput,
	Popover,
	PasswordInput,
	Progress,
} from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { PolymorphicComponentProps, createPolymorphicComponent } from '@mantine/utils'
import { useTranslation, Trans } from 'next-i18next'
import { useState, type ElementType, forwardRef } from 'react'
import { z } from 'zod'

import { Link, Button } from '~ui/components/core'
import { useScreenSize, useCustomVariant } from '~ui/hooks'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { ModalTitle } from './ModalTitle'
import { openPrivacyStatementModal } from './PrivacyStatement'

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

type RichTranslateProps = {
	i18nKey: string
	values?: Record<string, any>
}
export const RichTranslate = (props: RichTranslateProps) => {
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
				loginLink: <Link external>.</Link>,
				button: <Button variant='secondary-icon'>.</Button>,
				group: <Stack align='center'>.</Stack>,
			}}
			{...props}
		/>
	)
}

type SignUpForm = {
	email: string
	name: string
	password: string
}
export const SignUpModalBody = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
	const { t } = useTranslation()
	const { isMobile } = useScreenSize()
	const [opened, setOpened] = useState(false)
	const [step, setStep] = useState(1)
	const [pwPopover, setPwPopover] = useState(false)
	const variants = useCustomVariant()
	const theme = useMantineTheme()
	const signUpAction = api.user.create.useMutation()

	const SignUpSchema = z.object({
		name: z.string(),
		email: z.string().email({ message: t('form-error-enter-valid-email') as string }),
		password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[$&+,:;=?@#|'<>.^*()%!-]).{8,}$/, {
			message: t('form-error-password-req') as string,
		}),
	})
	const form = useForm<SignUpForm>({
		validate: zodResolver(SignUpSchema),
		initialValues: {
			email: '',
			name: '',
			password: '',
		},
		validateInputOnBlur: true,
	})
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

	const modalTitle = (
		<ModalTitle breadcrumb={{ option: 'close' }} rightText={t('step-x-y', { ns: 'common', x: step, y: 2 })} />
	)

	const step1 = <RichTranslate i18nKey='sign-up-modal-body' />

	const formName = (
		<TextInput
			required
			label={t('sign-up-name-alias')}
			description={t('sign-up-name-use-any')}
			placeholder={t('sign-up-enter-name-alias') as string}
			{...form.getInputProps('name')}
		/>
	)
	const formEmail = (
		<TextInput
			required
			label={t('email')}
			placeholder={t('enter-email-placeholder') as string}
			{...form.getInputProps('email')}
		/>
	)
	const formPassword = (
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
	const signUpButton = (
		<>
			<Button disabled={!form.isValid()} onClick={() => signUpAction.mutate(form.values)}>
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
							<Link
								key={0}
								external
								onClick={() => openPrivacyStatementModal()}
								variant={variants.Link.inheritStyle}
							>
								Privacy Policy
							</Link>
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

	const step2Reg = (
		<Stack>
			{formName}
			{formEmail}
			{formPassword}
			{signUpButton}
		</Stack>
	)

	return (
		<>
			<Modal opened={opened} onClose={() => setOpened(false)} fullScreen={isMobile} title={modalTitle}>
				<Stack spacing={24} align='center'>
					<RichTranslate i18nKey='sign-up-header' />
					{step2Reg}
				</Stack>
			</Modal>
			<Box component='button' ref={ref} onClick={() => setOpened(true)} {...props} />
		</>
	)
})

SignUpModalBody.displayName = 'SignupModalBody'

export const SignupModalLauncher = createPolymorphicComponent<'button', ButtonProps>(SignUpModalBody)
