/* eslint-disable i18next/no-literal-string */

import { Overlay, Stack, Tabs, Title } from '@mantine/core'
import { type GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { type Route } from 'nextjs-routes'
import { useEffect, useState } from 'react'

import { trpcServerClient } from '@weareinreach/api/trpc'
import { checkServerPermissions } from '@weareinreach/auth'
import { Icon } from '@weareinreach/ui/icon'
import { QuickPromotionModal } from '@weareinreach/ui/modals'
import { getServerSideTranslations } from '~app/utils/i18n'

const QuickLinkIndex = () => {
	const router = useRouter()
	const { data: session, status: sessionStatus } = useSession()
	const [overlay, setOverlay] = useState(sessionStatus === 'unauthenticated')

	useEffect(() => {
		if (!session && sessionStatus === 'unauthenticated') {
			setOverlay(true)
		} else if (session && sessionStatus === 'authenticated') {
			setOverlay(false)
		}
	}, [session, sessionStatus])

	return (
		<>
			<Tabs value={router.pathname} onTabChange={(value) => router.push(value as unknown as Route)}>
				<Tabs.List>
					<Tabs.Tab value='/admin/quicklink/phone'>Phone Numbers</Tabs.Tab>
					<Tabs.Tab value='/admin/quicklink/email'>Email Addresses</Tabs.Tab>
					<Tabs.Tab value='/admin/quicklink/services'>Location Services</Tabs.Tab>
				</Tabs.List>
			</Tabs>
			<Stack h='40vh'>
				<Title order={2} pl={170} pt={20}>
					<Icon icon='carbon:arrow-up-left' height={48} style={{ paddingRight: 8 }} />
					Select tab above
				</Title>
			</Stack>
			{overlay && (
				<Overlay blur={2}>
					<QuickPromotionModal autoLaunch noClose />
				</Overlay>
			)}
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
