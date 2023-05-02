/* eslint-disable react/no-unescaped-entities */
import {
	Stack,
	Text,
	Loader,
	Title,
	type ButtonProps,
	Modal,
	createPolymorphicComponent,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useRouter } from 'next/router'
import { useTranslation, Trans } from 'next-i18next'
import { forwardRef, useState, useEffect } from 'react'
import { z } from 'zod'
import { decodeUrl } from '@weareinreach/api/lib/encodeUrl'

import { Link } from '~ui/components/core'
import { useCustomVariant } from '~ui/hooks'
import { trpc as api } from '~ui/lib/trpcClient'

import { LoginModalLauncher } from './Login'
import { ModalTitle } from './ModalTitle'

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

export const AccountVerifyModalBody = forwardRef<HTMLButtonElement, AccountVerifyModalBodyProps>(
	(props, ref) => {
		const { t } = useTranslation(['common'])
		const router = useRouter()
		const autoOpen = Boolean(router.query['c'])
		const variants = useCustomVariant()
		const [success, setSuccess] = useState(false)
		const [error, setError] = useState(!UrlParams.safeParse(router.query).success)
		const verifyAccount = api.user.confirmAccount.useMutation({
			onSuccess: () => setSuccess(true),
			onError: () => setError(true),
		})
		const DataSchema = z.string().default('')
		const [opened, handler] = useDisclosure(autoOpen)

		useEffect(() => {
			if (!success && !verifyAccount.isLoading && opened && !error) {
				verifyAccount.mutate(UrlParams.transform(({ c, code }) => ({ data: c, code })).parse(router.query))
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [success, verifyAccount.isLoading, opened, error])

		const modalTitle = <ModalTitle breadcrumb={{ option: 'close', onClick: () => handler.close() }} />

		const bodyWorking = (
			<Stack align='center' spacing={24}>
				<Stack spacing={0} align='center'>
					<Title order={2}>{t('verify-account.verifying')}</Title>
					<Text variant={variants.Text.utility1darkGray}>{t('words.please-wait')}</Text>
				</Stack>
				<Loader size='lg' />
			</Stack>
		)

		const bodySuccess = (
			<Stack align='center' spacing={24}>
				<Stack spacing={0} align='center'>
					<Title order={1}>✅</Title>
					<Title order={2}>{t('verify-account.verified')}</Title>
				</Stack>
				<Trans
					i18nKey='verify-account.verified-body'
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
					{success ? bodySuccess : error ? bodyError : bodyWorking}
				</Modal>
				{/* <Box component='button' ref={ref} onClick={() => handler.open()} {...props} /> */}
			</>
		)
	}
)

AccountVerifyModalBody.displayName = 'AccountVerifyModal'

export const AccountVerifyModal = createPolymorphicComponent<'button', AccountVerifyModalBodyProps>(
	AccountVerifyModalBody
)

export interface AccountVerifyModalBodyProps extends ButtonProps {}

type FormProps = {
	data: string
	password: string
	confirmPassword: string
}
