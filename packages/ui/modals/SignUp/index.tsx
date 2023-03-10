import { Modal, Box, type ButtonProps, Text, Title, Stack } from '@mantine/core'
import { zodResolver } from '@mantine/form'
import { createPolymorphicComponent } from '@mantine/utils'
import { useRouter } from 'next/router'
import { useTranslation, Trans } from 'next-i18next'
import { useState, forwardRef } from 'react'
import { z } from 'zod'

import { Link, Button } from '~ui/components/core'
import { useScreenSize, useCustomVariant } from '~ui/hooks'
import { trpc as api } from '~ui/lib/trpcClient'

import { SignUpFormProvider, useSignUpForm } from './context'
import { FormEmail, FormName, FormPassword, LanguageSelect, FormLocation } from './fields'
import { ModalTitle } from '../ModalTitle'
import { openPrivacyStatementModal } from '../PrivacyStatement'

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

export const SignUpModalBody = forwardRef<HTMLButtonElement, SignUpModalBodyProps>((props, ref) => {
	const { t } = useTranslation('common')
	const { isMobile } = useScreenSize()
	const [opened, setOpened] = useState(false)
	const [step, setStep] = useState(1)
	const variants = useCustomVariant()
	const signUpAction = api.user.create.useMutation()
	const { locale } = useRouter()

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
			language: locale,
			searchLocation: '',
			locationOptions: [],
		},
		validateInputOnBlur: true,
	})

	const modalTitle = (
		<ModalTitle
			breadcrumb={{ option: 'close', onClick: () => setOpened(false) }}
			rightText={t('step-x-y', { ns: 'common', x: step, y: 2 })}
		/>
	)

	const step1 = <RichTranslate i18nKey='sign-up-modal-body' />

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
			<FormName />
			<LanguageSelect />
			<FormEmail />
			<FormPassword />
			<FormLocation />
			{signUpButton}
		</Stack>
	)

	return (
		<>
			<Modal
				title={modalTitle}
				scrollAreaComponent={Modal.NativeScrollArea}
				opened={opened}
				onClose={() => setOpened(false)}
				fullScreen={isMobile}
				zIndex={500}
			>
				<SignUpFormProvider form={form}>
					<Stack spacing={24} align='center'>
						<RichTranslate i18nKey='sign-up-header' />
						{step2Reg}
					</Stack>
				</SignUpFormProvider>
			</Modal>
			<Box
				component='button'
				ref={ref}
				onClick={() => {
					setOpened(true)
				}}
				{...props}
			/>
		</>
	)
})

SignUpModalBody.displayName = 'SignupModalBody'

export const SignupModalLauncher = createPolymorphicComponent<'button', SignUpModalBodyProps>(SignUpModalBody)

interface SignUpModalBodyProps extends ButtonProps {}
