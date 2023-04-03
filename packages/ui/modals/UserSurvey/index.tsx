import {
	Modal,
	Box,
	type ButtonProps,
	Checkbox,
	createStyles,
	Group,
	Radio,
	Text,
	Title,
	Stack,
	rem,
	ScrollArea,
} from '@mantine/core'
import { zodResolver } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { createPolymorphicComponent } from '@mantine/utils'
import { useRouter } from 'next/router'
import { useTranslation, Trans } from 'next-i18next'
import { useState, forwardRef, Dispatch, SetStateAction } from 'react'
import { string, z } from 'zod'

import { Link, Button, ModalTitleBreadcrumb } from '~ui/components/core'
import { useScreenSize, useCustomVariant } from '~ui/hooks'
import { trpc as api } from '~ui/lib/trpcClient'

import { UserSurveyFormProvider, useUserSurveyForm } from './context'
import { FormBirthyear } from './fields'
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
	answerContainer: {
		height: '322px',
	},
	scroll: {
		width: '100%',
	},
}))

export const UserSurveyModalBody = forwardRef<HTMLButtonElement, UserSurveyModalBodyProps>((props, ref) => {
	const { data: surveyOptions, status } = api.user.surveyOptions.useQuery()
	const { t } = useTranslation('common')
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
			birthYear: '',
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
		console.log(form.values)
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
				<Button className={classes.skipNext} variant={'secondary-icon'} onClick={() => setStep(stepNumber)}>
					{t('words.skip')}
				</Button>
				<Button className={classes.skipNext} variant={'primary-icon'} onClick={() => setStep(stepNumber)}>
					{t('words.next')}
				</Button>
			</Group>
		)
	}

	const titleSubtitle = (t1: string, t2: string) => {
		return (
			<>
				<Title order={2}>{t(t1)}</Title>
				<Text variant={variants.Text.darkGray}>{t(t2)}</Text>
			</>
		)
	}

	const step1 = () => {
		return (
			<>
				{titleSubtitle('survey.question-1-title', 'survey.question-subtitle')}
				<ScrollArea h={336} offsetScrollbars className={classes.scroll}>
					<Radio.Group value='selected' className={classes.answerContainer}>
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
				</ScrollArea>

				{modalButtons(2)}
			</>
		)
	}

	const step2 = () => {
		return (
			<>
				{titleSubtitle('survey.question-2-title', 'survey.question-subtitle')}
				<ScrollArea h={336} offsetScrollbars className={classes.scroll}>
					<Radio.Group value='selected' className={classes.answerContainer}>
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
				</ScrollArea>
				{modalButtons(3)}
			</>
		)
	}

	const step3 = () => {
		return (
			<>
				{titleSubtitle('survey.question-3-title', 'survey.question-subtitle')}
				<ScrollArea h={336} offsetScrollbars className={classes.scroll}>
					<Checkbox.Group className={classes.answerContainer}>
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
				</ScrollArea>
				{modalButtons(4)}
			</>
		)
	}

	const step4 = () => {
		return (
			<>
				{titleSubtitle('survey.question-4-title', 'survey.question-subtitle')}
				<ScrollArea h={336} offsetScrollbars className={classes.scroll}>
					<Checkbox.Group className={classes.answerContainer}>
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
				</ScrollArea>
				{modalButtons(5)}
			</>
		)
	}

	const step5 = () => {
		return (
			<>
				{titleSubtitle('survey.question-5-title', 'survey.question-subtitle')}
				<FormBirthyear />
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
			</>
		)
	}

	const UserSurveyButton = (
		<Button disabled={!form.isValid()} onClick={submitHandler} loading={UserSurveyAction.isLoading}>
			{t('sign-up')}
		</Button>
	)

	const getQuestion = (q: number) => {
		switch (q) {
			case 1: {
				return step1()
			}
			case 2: {
				return step2()
			}
			case 3: {
				return step3()
			}
			case 4: {
				return step4()
			}
			case 5: {
				return step5()
			}
			default:
				return step1()
		}
	}
	const UserSurveyBody = getQuestion(step)

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
