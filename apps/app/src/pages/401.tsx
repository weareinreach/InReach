import { Container, rem, Stack, Title } from '@mantine/core'
import { type GetStaticProps } from 'next'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { type Route } from 'nextjs-routes'
import { z } from 'zod'

import { isSafeRelativePath } from '@weareinreach/util/url'
import { getServerSideTranslations } from '~app/utils/i18n'
// import { LoginBody } from '@weareinreach/ui/modals/Login'

const LoginBody = dynamic(() => import('@weareinreach/ui/modals/LoginSignUp').then((mod) => mod.LoginBody), {
	ssr: false,
})

const RouteSchema = z.object({
	// Must be a same-origin relative path - without this, a crafted `callbackUrl` could redirect a user
	// off-site immediately after they sign in (`pathname` otherwise accepts any string, including a full
	// `https://attacker.example` URL, which `router.push` happily navigates to).
	pathname: z.string().refine(isSafeRelativePath, 'pathname must be a relative, same-origin path'),
	query: z.record(z.string(), z.string()).optional(),
	locale: z.string().optional(),
})

/** `callbackUrl` is attacker-controlled query input - never let a parse failure throw during render. */
const parseCallbackUrl = (raw: string) => {
	try {
		return RouteSchema.safeParse(JSON.parse(Buffer.from(raw, 'base64').toString('utf-8')))
	} catch {
		return undefined
	}
}

const Unauthorized = () => {
	const { t } = useTranslation('common')
	const router = useRouter()
	const callback =
		typeof router.query.callbackUrl === 'string' ? parseCallbackUrl(router.query.callbackUrl) : undefined

	return (
		<Container>
			<Stack
				m={{ base: `${rem(48)} ${rem(0)}`, xs: `${rem(80)} ${rem(0)}`, sm: `${rem(100)} ${rem(0)}` }}
				align='center'
				gap={32}
			>
				<Stack gap={0} align='center'>
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
