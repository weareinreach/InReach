import { Modal, Box, type ButtonProps, createStyles, Group, Text, Title, Stack, rem } from '@mantine/core'
import { zodResolver } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { createPolymorphicComponent } from '@mantine/utils'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useState, forwardRef, Dispatch, SetStateAction } from 'react'
import { z } from 'zod'

import { Button, ModalTitleBreadcrumb } from '~ui/components/core'
import { useScreenSize, useCustomVariant } from '~ui/hooks'
import { trpc as api } from '~ui/lib/trpcClient'

import { UserSurveyFormProvider, useUserSurveyForm } from './context'
import { FormBirthyear, FormCountry, FormIdentity, FormImmigration, FormEthnicity } from './fields'
import { ModalTitle } from '../ModalTitle'

const useStyles = createStyles((theme) => ({
	btnGroup: {
		width: '100%',
		paddingTop: rem(20),
		borderTop: `solid ${rem(1)} ${theme.other.colors.primary.lightGray}`,
	},
	skipNext: {
		width: '50%',
	},
}))

export const UserSurveyModalBody = forwardRef<HTMLButtonElement, UserSurveyModalBodyProps>((props, ref) => {
	const { t } = useTranslation(['common', 'country'])
	const { isMobile } = useScreenSize()
	const [opened, handler] = useDisclosure(false)
	const [stepOption, setStepOption] = useState<string | null>('step1')
	const [step, setStep] = useState<number>(1)
	const [successMessage, setSuccessMessage] = useState(false)
	const variants = useCustomVariant()
	const { classes } = useStyles()
	const UserSurveyAction = api.user.submitSurvey.useMutation({
		onSuccess: () => {
			setSuccessMessage(true)
		},
	})

	const router = useRouter()

	const UserSurveySchema = z
		.object({
			birthYear: z.number(),
			reasonForJoin: z.string(),
			communityIds: z.array(z.string()),
			ethnicityIds: z.array(z.string()),
			identifyIds: z.array(z.string()),
			countryOriginId: z.string(),
			immigrationId: z.string(),
		})
		.partial()

	const form = useUserSurveyForm({
		validate: zodResolver(UserSurveySchema),
		initialValues: {
			birthYear: undefined,
			reasonForJoin: '',
			communityIds: [],
			ethnicityIds: [],
			identifyIds: [],
			countryOriginId: '',
			immigrationId: '',
		},
		validateInputOnBlur: true,
	})

	const submitHandler = () => {
		setSuccessMessage(true)
		//TODO call UserSurveyAction
		UserSurveyAction.mutate(form.values)
	}

	const breadcrumbProps: ModalTitleBreadcrumb =
		stepOption === null || successMessage
			? {
					option: 'close',
					onClick: () => {
						setStep(1)
						setStepOption(null)
						handler.close()
					},
			  }
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

	const modalButtons = (stepNumber: number) => {
		return (
			<Group position='center' className={classes.btnGroup} noWrap>
				<Button
					className={classes.skipNext}
					variant={'secondary-icon'}
					onClick={() => {
						setStep(stepNumber)
					}}
				>
					{t('words.skip')}
				</Button>
				<Button
					className={classes.skipNext}
					variant={'primary-icon'}
					onClick={() => {
						setStep(stepNumber)
					}}
				>
					{t('words.next')}
				</Button>
			</Group>
		)
	}

	const modalSubmitBtn = (
		<Group position='center' className={classes.btnGroup} noWrap>
			<Button
				className={classes.skipNext}
				variant={'secondary-icon'}
				onClick={submitHandler}
				loading={UserSurveyAction.isLoading}
			>
				{t('words.skip')}
			</Button>
			<Button
				className={classes.skipNext}
				variant={'primary-icon'}
				onClick={submitHandler}
				loading={UserSurveyAction.isLoading}
			>
				{t('survey.finish')}
			</Button>
		</Group>
	)

	const userSurveyBody = (q: number) => {
		switch (q) {
			case 1: {
				return (
					<>
						<FormImmigration />
						{modalButtons(2)}
					</>
				)
			}
			case 2: {
				return (
					<>
						<FormCountry />
						{modalButtons(3)}
					</>
				)
			}
			case 3: {
				return (
					<>
						<FormIdentity />
						{modalButtons(4)}
					</>
				)
			}
			case 4: {
				return (
					<>
						<FormEthnicity />
						{modalButtons(5)}
					</>
				)
			}
			case 5: {
				return (
					<>
						<FormBirthyear />
						{modalSubmitBtn}
					</>
				)
			}
			default:
				return (
					<>
						<FormImmigration />
						{modalButtons(2)}
					</>
				)
		}
	}

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
		return userSurveyBody(step)
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
