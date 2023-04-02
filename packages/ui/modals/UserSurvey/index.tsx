import { Modal, Box, type ButtonProps, Checkbox, Group, Radio, Text, Title, Stack } from '@mantine/core'
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
import { FormBirthyear } from './fields'
import { ModalTitle } from '../ModalTitle'

export const UserSurveyModalBody = forwardRef<HTMLButtonElement, UserSurveyModalBodyProps>((props, ref) => {
	const { data: surveyOptions, status } = api.user.surveyOptions.useQuery()
	const { t } = useTranslation('common')
	const { isMobile } = useScreenSize()
	const [opened, handler] = useDisclosure(false)
	const [stepOption, setStepOption] = useState<string | null>('step1')
	const [step, setStep] = useState<number>(1)
	const [successMessage, setSuccessMessage] = useState(false)
	const variants = useCustomVariant()
	const UserSurveyAction = api.user.submitSurvey.useMutation({
		onSuccess: () => {
			setSuccessMessage(true)
		},
	})

	console.log(surveyOptions)
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
			currentCity: z.string(),
			currentGovDistId: z.string(),
			currentCountryId: z.string(),
		})
		.partial()

	const form = useUserSurveyForm({
		validate: zodResolver(UserSurveySchema),
		initialValues: {
			// birthYear: 0,
			reasonForJoin: '',
			communityIds: [],
			ethnicityIds: [],
			identifyIds: [],
			countryOriginId: '',
			immigrationId: '',
			currentCity: '',
			currentGovDistId: '',
			currentCountryId: '',
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

	const step1 = () => {
		return (
			<>
				<Title order={2}>{t('survey.question-1-title')}</Title>
				<Text variant={variants.Text.darkGray}>{t('survey.question-subtitle')}</Text>
				<Radio.Group value='selected'>
					<Stack>
						{surveyOptions?.immigration.map((item, index) => {
							return (
								<Radio
									label={t(item.tsKey, { ns: 'user' })}
									key={item.id}
									value={item.id}
									// {...form.getInputProps(`${categoryId}.${index}.checked`, { type: 'checkbox' })}
								/>
							)
						})}
					</Stack>
				</Radio.Group>
				<Group position='center'>
					<Button
						onClick={() => {
							setStepOption('step2')
							setStep(2)
						}}
					>
						{t('words.skip')}
					</Button>
					<Button
						onClick={() => {
							setStepOption('step2')
							setStep(2)
						}}
					>
						{t('words.next')}
					</Button>
				</Group>
			</>
		)
	}

	const step2 = () => {
		return (
			<>
				<Title order={2}>{t('survey.question-2-title')}</Title>
				<Text variant={variants.Text.darkGray}>{t('survey.question-subtitle')}</Text>
				<Radio.Group value='selected'>
					<Stack>
						{surveyOptions?.countries.map((item, index) => {
							return (
								<Radio
									label={t(item.tsKey, { ns: 'user' })}
									key={item.id}
									value={item.id}
									// {...form.getInputProps(`${categoryId}.${index}.checked`, { type: 'checkbox' })}
								/>
							)
						})}
					</Stack>
				</Radio.Group>
				<Group position='center'>
					<Button
						onClick={() => {
							setStepOption('step3')
							setStep(3)
						}}
					>
						{t('words.skip')}
					</Button>
					<Button
						onClick={() => {
							setStepOption('step3')
							setStep(3)
						}}
					>
						{t('words.next')}
					</Button>
				</Group>
			</>
		)
	}

	const step3 = () => {
		return (
			<>
				<Title order={2}>{t('survey.question-3-title')}</Title>
				<Text variant={variants.Text.darkGray}>{t('survey.question-subtitle')}</Text>
				<Checkbox.Group>
					<Stack>
						{surveyOptions?.sog.map((item, index) => {
							return (
								<Checkbox
									value={item.id}
									checked={false}
									label={t(item.tsKey, { ns: 'user' })}
									key={item.id}

									// {...form.getInputProps(`${categoryId}.${index}.checked`, { type: 'checkbox' })}
								/>
							)
						})}
					</Stack>
				</Checkbox.Group>
				<Group position='center'>
					<Button
						onClick={() => {
							setStepOption('step4')
							setStep(4)
						}}
					>
						{t('words.skip')}
					</Button>
					<Button
						onClick={() => {
							setStepOption('step4')
							setStep(4)
						}}
					>
						{t('words.next')}
					</Button>
				</Group>
			</>
		)
	}

	const step4 = () => {
		return (
			<>
				<Title order={2}>{t('survey.question-4-title')}</Title>
				<Text variant={variants.Text.darkGray}>{t('survey.question-subtitle')}</Text>
				<Checkbox.Group>
					<Stack>
						{surveyOptions?.ethnicity.map((item, index) => {
							return (
								<Checkbox
									value={item.id}
									checked={false}
									label={t(item.tsKey, { ns: 'user' })}
									key={item.id}

									// {...form.getInputProps(`${categoryId}.${index}.checked`, { type: 'checkbox' })}
								/>
							)
						})}
					</Stack>
				</Checkbox.Group>
				<Group position='center'>
					<Button
						onClick={() => {
							setStepOption('step5')
							setStep(5)
						}}
					>
						{t('words.skip')}
					</Button>
					<Button
						onClick={() => {
							setStepOption('step5')
							setStep(5)
						}}
					>
						{t('words.next')}
					</Button>
				</Group>
			</>
		)
	}

	const step5 = () => {
		return (
			<>
				<Title order={2}>{t('survey.question-5-title')}</Title>
				<Text variant={variants.Text.darkGray}>{t('survey.question-subtitle')}</Text>
				<FormBirthyear />
				<Group position='center'>
					<Button
						onClick={() => {
							setStepOption('step6')
							setSuccessMessage(true)
						}}
					>
						{t('words.skip')}
					</Button>
					<Button
						onClick={() => {
							setStepOption('step6')
							setSuccessMessage(true)
						}}
					>
						{t('survey.finish')}
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
	const UserSurveyBody = <>{getQuestion(stepOption)}</>

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
