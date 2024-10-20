import {
	Button,
	type ButtonProps,
	createPolymorphicComponent,
	Group,
	Loader,
	Modal,
	Stack,
	Text,
	Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useRouter } from 'next/router'
import { Trans, useTranslation } from 'next-i18next'
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react'
import { z } from 'zod'

import { decodeUrl } from '@weareinreach/api/lib/encodeUrl'
// import { Button } from '~ui/components/core/Button'
import { Link } from '~ui/components/core/Link'
import { useCustomVariant, useScreenSize } from '~ui/hooks'
import { trpc as api } from '~ui/lib/trpcClient'

import { ModalTitle } from './ModalTitle'
import { PrivacyStatementModal } from './PrivacyStatement'
import { UserSurveyModalLauncher } from './UserSurvey'

const isRecord = (data: unknown) => z.record(z.any()).safeParse(data).success
const UrlParams = z.object({ c: z.string(), code: z.string() }).refine((data) => {
	try {
		const obj = decodeUrl(data.c)
		return isRecord(obj)
	} catch (error) {
		console.error(error)
		return false
	}
})

const AccountVerifyModalBody = forwardRef<HTMLButtonElement, AccountVerifyModalBodyProps>(
	(/*props, ref*/) => {
		const { t } = useTranslation(['common'])
		const router = useRouter()
		const autoOpen = Boolean(router.query['c'])
		const variants = useCustomVariant()
		const [success, setSuccess] = useState(false)
		const [error, setError] = useState(false)
		const [codeSent, setCodeSent] = useState(false)
		const verifyAccount = api.user.confirmAccount.useMutation({
			onSuccess: () => setSuccess(true),
			onError: () => setError(true),
		})
		const resendCode = api.user.resendCode.useMutation({
			onSuccess: () => setCodeSent(true),
		})

		const handleResendCode = useCallback((data: string) => () => resendCode.mutate({ data }), [resendCode])

		const hasError = useMemo(() => {
			if (!verifyAccount.isError) {
				return false
			}
			if (verifyAccount.error.data?.cause instanceof Error && verifyAccount.error.data?.cause?.name) {
				return verifyAccount.error.data.cause.name
			}
			return 'UnknownError'
		}, [verifyAccount.error?.data?.cause, verifyAccount.isError])

		// const DataSchema = z.string().default('')
		const [opened, handler] = useDisclosure(autoOpen)
		const { isMobile } = useScreenSize()

		useEffect(() => {
			if (router.query.c !== undefined) {
				handler.open()
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [router.query.c])

		const parsedData = UrlParams.transform(({ c, code }) => ({ data: c, code })).safeParse(router.query)

		const dataToVerify = useMemo(
			() => (parsedData.success ? parsedData.data : null),
			[parsedData.success, parsedData?.data]
		)
		const readyToVerify = useMemo(() => {
			if (success || error || verifyAccount.isLoading) {
				return false
			}
			return opened && dataToVerify !== null
		}, [success, error, verifyAccount.isLoading, opened, dataToVerify])
		useEffect(() => {
			if (readyToVerify && dataToVerify !== null) {
				verifyAccount.mutate(dataToVerify)
			}
		}, [readyToVerify, dataToVerify, verifyAccount])

		const modalTitle = useMemo(
			() => <ModalTitle breadcrumb={{ option: 'close', onClick: handler.close }} />,
			[handler]
		)

		const bodyWorking = useMemo(
			() => (
				<Stack align='center' spacing={24}>
					<Stack spacing={0} align='center'>
						<Title order={2}>{t('verify-account.verifying')}</Title>
						<Text variant={variants.Text.utility1darkGray}>{t('words.please-wait')}</Text>
					</Stack>
					<Loader size='lg' />
				</Stack>
			),
			[t, variants]
		)

		const bodySuccess = useMemo(
			() => (
				<Stack align='center' spacing={40}>
					<Stack align='center' spacing={24}>
						<Stack spacing={0} align='center'>
							<Title order={1}>📋</Title>
							<Title order={2} ta='center'>
								{t('survey.launch-title')}
							</Title>
						</Stack>
						<Text variant={variants.Text.darkGray} ta='center'>
							<Trans
								i18nKey='survey.launch-item1'
								components={{
									Bold: <Title order={3} display='inline' />,
								}}
							/>
						</Text>
						<Text variant={variants.Text.darkGray} ta='center'>
							<Trans
								i18nKey='survey.launch-item2'
								components={{
									Bold: <Title order={3} display='inline' />,
								}}
							/>
						</Text>
						<PrivacyStatementModal component={Link} variant={variants.Link.inlineUtil2darkGray}>
							{t('privacy-policy')}
						</PrivacyStatementModal>
					</Stack>
					<Group>
						<Button variant={variants.Button.secondaryLg} onClick={handler.close} radius='md'>
							{t('survey.not-right-now')}
						</Button>
						<UserSurveyModalLauncher component={Button} variant={variants.Button.primaryLg}>
							{t('survey.start-survey')}
						</UserSurveyModalLauncher>
					</Group>
				</Stack>
			),
			[t, variants, handler]
		)

		const errorI18nKey = useMemo(() => {
			switch (hasError) {
				case 'NotAuthorizedException':
				case 'CodeMismatchException': {
					return 'errors.code-mismatch'
				}
				case 'ExpiredCodeException': {
					return 'errors.code-expired'
				}
				default: {
					return 'errors.try-again-text'
				}
			}
		}, [hasError])

		const bodyError = useMemo(() => {
			return (
				<Stack align='center' spacing={24}>
					<Stack spacing={0} align='center'>
						<Title order={1}>🫣</Title>
						<Title order={2}>{t('errors.oh-no')}</Title>
					</Stack>
					<Trans
						i18nKey={errorI18nKey}
						components={{
							Text: <Text variant={variants.Text.utility1darkGray}>.</Text>,
						}}
					/>
					{errorI18nKey !== 'errors.try-again-text' && parsedData.data && (
						<Button variant={variants.Button.primarySm} onClick={handleResendCode(parsedData.data.data)}>
							{t('errors.resend-code')}
						</Button>
					)}
				</Stack>
			)
		}, [errorI18nKey, t, variants, handleResendCode, parsedData.data])

		const bodyCodeResent = useMemo(
			() => (
				<Stack align='center' spacing={24}>
					<Stack spacing={0} align='center'>
						<Title order={1}>📬</Title>
						<Title order={2}>{t('confirm-account.code-requested')}</Title>
					</Stack>
					<Text variant={variants.Text.utility1darkGray}>{t('confirm-account.code-resent')}</Text>
				</Stack>
			),
			[t, variants]
		)

		const renderBody = useMemo(() => {
			if (success) {
				return bodySuccess
			}
			if (codeSent) {
				return bodyCodeResent
			}
			if (error) {
				return bodyError
			}
			return bodyWorking
		}, [bodyCodeResent, bodyError, bodySuccess, bodyWorking, codeSent, error, success])

		return (
			<Modal title={modalTitle} opened={opened} onClose={handler.close} fullScreen={isMobile}>
				{renderBody}
			</Modal>
		)
	}
)
AccountVerifyModalBody.displayName = 'AccountVerifyModal'
export const AccountVerifyModal = createPolymorphicComponent<'button', AccountVerifyModalBodyProps>(
	AccountVerifyModalBody
)

export type AccountVerifyModalBodyProps = ButtonProps
