/* eslint-disable i18next/no-literal-string */

import { Stack, Tabs, Title } from '@mantine/core'
import { type GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { type Route } from 'nextjs-routes'

import { trpcServerClient } from '@weareinreach/api/trpc'
import { checkServerPermissions } from '@weareinreach/auth'
import { getServerSideTranslations } from '~app/utils/i18n'

const QuickLinkIndex = () => {
	const router = useRouter()

	return (
		<>
			<Tabs value={router.pathname} onTabChange={(value) => router.push(value as unknown as Route)}>
				<Tabs.List>
					<Tabs.Tab value='/admin/quicklink/phone'>Phone Numbers</Tabs.Tab>
					<Tabs.Tab value='/admin/quicklink/email'>Email Addresses</Tabs.Tab>
				</Tabs.List>
			</Tabs>
			<Stack h='40vh'>
				<Title order={2}>Select tab above</Title>
			</Stack>
		</>
	)
}
QuickLinkIndex.omitGrid = true
export const getServerSideProps: GetServerSideProps = async ({ locale, req, res }) => {
	const session = await checkServerPermissions({
		ctx: { req, res },
		permissions: 'root',
		has: 'all',
		returnNullSession: true,
	})
	if (session === false) {
		return {
			redirect: {
				destination: '/',
				permanent: false,
			},
		}
	}
	const ssg = await trpcServerClient({ session })
	if (session) {
		await ssg.quicklink.getPhoneData.prefetch({ limit: 20, skip: 0 })
		await ssg.quicklink.getEmailData.prefetch({ limit: 20, skip: 0 })
	}

	return {
		props: {
			session,
			trpcState: ssg.dehydrate(),
			...(await getServerSideTranslations(locale, ['common'])),
		},
	}
}

export default QuickLinkIndex
