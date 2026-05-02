import {
	Alert,
	Box,
	MultiSelect,
	Paper,
	Radio,
	Stack,
	Text,
	TextInput,
	Title,
	useMantineTheme,
} from '@mantine/core'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import { Button } from '~ui/components/core/Button'
import { LangPicker } from '~ui/components/core/LangPicker'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { Icon } from '~ui/icon'
import { trpc } from '~ui/lib/trpcClient'

export const ReportSubmit = ({
	type = 'body',
	closeModalHandler,
	itemId,
	itemName,
	orgId,
	orgName,
	serviceId,
	serviceName,
}: ReportSubmitProps) => {
	const { data: session } = useSession()
	const { t } = useTranslation('common')
	const theme = useMantineTheme()
	const variant = useCustomVariant()
	const isBody = type === 'body'

	const [issueType, setIssueType] = useState<string | undefined>(undefined)
	const [incorrectInfoFields, setIncorrectInfoFields] = useState<string[]>([])
	const [language, setLanguage] = useState<string | undefined>(undefined)
	const [note, setNote] = useState('')
	const [successMessage, setSuccessMessage] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	const isIncorrectInfo = issueType === 'incorrect-info'
	const isSomethingElse = issueType === 'something-else'
	const isTranslation = issueType === 'translation-quality'

	const isInvalid =
		!issueType ||
		(isIncorrectInfo && (incorrectInfoFields.length === 0 || !note.trim())) ||
		(isSomethingElse && !note.trim()) ||
		(isTranslation && (!language || !note.trim()))

	const reportMutation = trpc.report.create.useMutation({
		onSuccess: () => {
			setTimeout(() => {
				setSuccessMessage(true)
				setErrorMessage(null)
			}, 100)
		},
		onError: (error) => {
			setErrorMessage(error.message || t('errors.something-went-wrong'))
		},
	})

	const handleSubmit = () => {
		if (isInvalid) return
		setErrorMessage(null)

		reportMutation.mutate({
			orgId: orgId || (!serviceId ? itemId : ''),
			orgName: orgName || (!serviceId ? itemName : undefined),
			serviceId: serviceId || undefined,
			serviceName: serviceId ? serviceName || itemName : undefined,
			issueType: issueType as 'closed-inactive' | 'incorrect-info' | 'translation-quality' | 'something-else',
			note: note.trim(),
			incorrectInfoFields: isIncorrectInfo ? incorrectInfoFields : [],
			language: isTranslation ? language : undefined,
			user: session?.user
				? {
						name: session.user.name ?? null,
						email: session.user.email ?? null,
					}
				: null,
		})
	}

	const successBody = (
		<Stack spacing={24} align='center' py='xl'>
			<Title order={1}>🎉</Title>
			<Title order={2} align='center'>
				{t('report.thank-you', {
					defaultValue: 'Thank you for helping us make InReach better for everyone!',
				})}
			</Title>
			<Text align='center' variant={variant.Text.darkGray}>
				{t('report.thank-you-message', {
					defaultValue:
						'Our team will review your submission, verify the information, and make changes accordingly if it meets our criteria.',
				})}
			</Text>
			{closeModalHandler && (
				<Button variant='outline' mt='xl' onClick={closeModalHandler}>
					{t('words.close', { defaultValue: 'Close' })}
				</Button>
			)}
		</Stack>
	)

	const component = (
		<Stack>
			<Stack align='flex-start' spacing='xs'>
				<Title order={4}>Report an issue</Title>
				<Stack spacing={0}>
					<Text size='sm'>
						Organization Name:{' '}
						<strong>
							{orgName || (!serviceId ? itemName : '') || t('words.unknown', { defaultValue: 'Unknown' })}
						</strong>
					</Text>
					<Text size='xs' color='dimmed' italic>
						Organization ID: {orgId || (!serviceId ? itemId : '') || 'N/A'}
					</Text>
				</Stack>
				{serviceId && (
					<Stack spacing={0} mt='xs'>
						<Text size='sm'>
							Service Name:{' '}
							<strong>{serviceName || itemName || t('words.unknown', { defaultValue: 'Unknown' })}</strong>
						</Text>
						<Text size='xs' color='dimmed' italic>
							Service ID: {serviceId || itemId || 'N/A'}
						</Text>
					</Stack>
				)}
			</Stack>
			<Stack>
				<Radio.Group label={t('Issue Type')} mt='md' size='xs' value={issueType} onChange={setIssueType}>
					<Stack spacing='sm' mt='xs'>
						<Radio
							value='closed-inactive'
							label={
								serviceId
									? t('Service inactive / no longer provided')
									: t('This organization is closed or inactive')
							}
						/>

						<Box>
							<Radio value='incorrect-info' label={t('Incorrect Information')} />
							{isIncorrectInfo && (
								<Box ml='xl' mt='xs'>
									<MultiSelect
										label={t('What information is incorrect?')}
										placeholder={t('Select all that apply')}
										data={
											serviceId
												? [
														{ value: 'description', label: t('Description') },
														{ value: 'contact-info', label: t('Contact info') },
														{ value: 'cost', label: t('Cost') },
														{ value: 'eligibility', label: t('Eligibility requirements') },
														{ value: 'something-else', label: t('Something else') },
													]
												: [
														{ value: 'name', label: t('Name') },
														{ value: 'description', label: t('Description') },
														{ value: 'contact-info', label: t('Contact information') },
														{ value: 'physical-address', label: t('Physical address') },
														{ value: 'something-else', label: t('Something else') },
													]
										}
										value={incorrectInfoFields}
										onChange={setIncorrectInfoFields}
										size='xs'
										w='100%'
									/>
								</Box>
							)}
						</Box>

						<Box>
							<Radio value='translation-quality' label={t('Translation quality')} />
							{isTranslation && (
								<Box ml='xl' mt='xs'>
									<LangPicker
										value={language}
										onChange={setLanguage}
										variant='form'
										label={t('Which language needs correction?')}
									/>
								</Box>
							)}
						</Box>

						{!isIncorrectInfo && <Radio value='something-else' label={t('Something else')} />}
					</Stack>
				</Radio.Group>

				{(isIncorrectInfo || isSomethingElse || isTranslation) && (
					<TextInput
						label={
							isTranslation
								? t('Translation Details')
								: isIncorrectInfo && incorrectInfoFields.length > 0
									? t('Corrected Information')
									: t('Add a note (optional)')
						}
						placeholder={
							isTranslation
								? t('Please specify the translation error and provide the correct wording if possible')
								: isIncorrectInfo && incorrectInfoFields.length > 0
									? t('Please provide the corrected information for the items selected above')
									: t('Please provide any other helpful information here')
						}
						value={note}
						onChange={(e) => setNote(e.currentTarget.value)}
						w='100%'
						mt='md'
						required={isIncorrectInfo || isSomethingElse || isTranslation}
					/>
				)}
				<Text size='xs' color='dimmed'>
					Sharing more information helps our team incorporate your suggestions or correct the issue.
				</Text>

				{errorMessage && (
					<Alert icon={<Icon icon='AlertCircle' />} title='Error' color='red'>
						{errorMessage}
					</Alert>
				)}

				<Button
					variant='primary'
					fullWidth
					mt='md'
					disabled={isInvalid}
					loading={reportMutation.isLoading}
					onClick={handleSubmit}
				>
					{t('words.save')}
				</Button>
			</Stack>
		</Stack>
	)

	const body = successMessage ? successBody : component

	if (type === 'modal') {
		return body
	}

	return (
		<Paper withBorder radius='lg' p={theme.spacing.lg}>
			{body}
		</Paper>
	)
}

export interface ReportSubmitProps {
	/** Is this being used in a page body or in a modal? */
	type?: 'body' | 'modal'
	closeModalHandler?: () => void
	itemId: string
	itemName: string
	orgId?: string
	orgName?: string
	serviceId?: string
	serviceName?: string
}
