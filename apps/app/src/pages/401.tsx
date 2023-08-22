import { Container, rem, Stack, Title } from '@mantine/core'
import { type GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { type Route } from 'nextjs-routes'
import { z } from 'zod'

import { getServerSideTranslations } from '~app/utils/i18n'
import { LoginBody } from '~ui/modals/Login'

const RouteSchema = z.object({
	pathname: z.string(),
	query: z.record(z.string()).optional(),
	locale: z.string().optional(),
})

const Unauthorized = () => {
	const { t } = useTranslation('common')
	const router = useRouter()
	const callback =
		typeof router.query.callbackUrl === 'string'
			? RouteSchema.safeParse(JSON.parse(Buffer.from(router.query.callbackUrl, 'base64').toString('utf-8')))
			: undefined

	return (
		<Container>
			<Stack
				m={{ base: `${rem(48)} ${rem(0)}`, xs: `${rem(80)} ${rem(0)}`, sm: `${rem(100)} ${rem(0)}` }}
				align='center'
				spacing={32}
			>
				<Stack spacing={0} align='center'>
					{/* eslint-disable-next-line i18next/no-literal-string */}
					<Title order={1}>🔐</Title>
					<Title order={1}>{t('errors.401-title')}</Title>
				</Stack>
				<LoginBody hideTitle callbackUrl={callback?.success ? (callback.data as Route) : undefined} />
			</Stack>
		</Container>
	)
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
	return {
		props: {
			...(await getServerSideTranslations(locale, ['common'])),
		},
		revalidate: 60 * 60 * 24 * 7,
	}
}

export default Unauthorized
