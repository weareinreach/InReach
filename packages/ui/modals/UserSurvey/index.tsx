import {
	Box,
	type ButtonProps,
	createPolymorphicComponent,
	Group,
	Modal,
	Stack,
	Text,
	Title,
} from '@mantine/core'
import { schemaResolver } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { forwardRef, useState } from 'react'
import { z } from 'zod'

import { type ModalTitleBreadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { useCustomVariant, useScreenSize, useShake } from '~ui/hooks'
import { trpc as api } from '~ui/lib/trpcClient'

import { UserSurveyFormProvider, useUserSurveyForm } from './context'
import { FormBirthyear, FormCountry, FormEthnicity, FormIdentity, FormImmigration } from './fields'
import classes from './index.module.css'
import { ModalTitle } from '../ModalTitle'

const SurveyModalBody = forwardRef<HTMLButtonElement, SurveyModalBodyProps>((props, ref) => {
	const { t } = useTranslation(['common', 'country', 'user'])
	const { isMobile } = useScreenSize()
	const [opened, handler] = useDisclosure(false)
	const [stepOption, setStepOption] = useState<string | null>('step1')
	const [step, setStep] = useState<number>(1)
	const [successMessage, setSuccessMessage] = useState(false)
	const variants = useCustomVariant()
	const { animateStyle, fireEvent: startShake } = useShake({ variant: 1 })
	const UserSurveyAction = api.user.submitSurvey.useMutation({
		onSuccess: () => {
			setSuccessMessage(true)
		},
		onError: (error) => {
			//add something here - refer to AccountVerified error body
			console.error(error)
		},
	})

	const router = useRouter()

	const maxYear = new Date().getFullYear()
	const minYear = maxYear - 100
	const birthYearError = t('survey.birthyear-req-value', { year1: minYear, year2: maxYear }) satisfies string
	const UserSurveySchema = z
		.object({
			birthYear: z
				.number({ error: birthYearError })
				.gte(minYear, { message: birthYearError })
				.lte(maxYear, { message: birthYearError })
				.or(z.literal('')),
			reasonForJoin: z.string(),
			communityIds: z.array(z.string()),
			ethnicityIds: z.array(z.string()),
			identifyIds: z.array(z.string()),
			countryOriginId: z.string(),
			immigrationId: z.string(),
		})
		.partial()

	const form = useUserSurveyForm({
		validate: schemaResolver(UserSurveySchema, { sync: true }),
		// Seeds every field so the TextInputs/NumberInput below start controlled - otherwise
		// they render with value={undefined} until touched, tripping React's
		// uncontrolled-to-controlled input warning (immigrationOther/ethnicityOther only render
		// conditionally, but still need seeding for whenever they do appear).
		initialValues: {
			birthYear: undefined,
			reasonForJoin: '',
			communityIds: [],
			ethnicityIds: [],
			identifyIds: [],
			countryOriginId: '',
			immigrationId: '',
			immigrationOther: '',
			ethnicityOther: '',
		},
		validateInputOnBlur: true,
	})

	const submitHandler = () => {
		if (!form.isValid()) return startShake()
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
			<Group justify='center' className={classes.btnGroup} wrap='nowrap'>
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
						if (!form.isValid()) return startShake()
						setStep(stepNumber)
					}}
				>
					{t('words.next')}
				</Button>
			</Group>
		)
	}

	const modalSubmitBtn = (
		<Group justify='center' className={classes.btnGroup} wrap='nowrap'>
			<Button
				className={classes.skipNext}
				variant={'secondary-icon'}
				onClick={submitHandler}
				loading={UserSurveyAction.isPending}
			>
				{t('words.skip')}
			</Button>
			<Button
				className={classes.skipNext}
				variant={'primary-icon'}
				onClick={submitHandler}
				loading={UserSurveyAction.isPending}
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
				opened={opened}
				onClose={() => handler.close()}
				fullScreen={isMobile}
				zIndex={500}
				style={animateStyle}
			>
				<UserSurveyFormProvider form={form}>
					<Stack gap={24} align='center'>
						{modalBody()}
					</Stack>
				</UserSurveyFormProvider>
			</Modal>
			<Box component='button' ref={ref} onClick={() => handler.open()} {...props} />
		</>
	)
})

SurveyModalBody.displayName = 'SurveyModalBody'

export const SurveyModalLauncher = createPolymorphicComponent<'button', SurveyModalBodyProps>(SurveyModalBody)

type SurveyModalBodyProps = ButtonProps
