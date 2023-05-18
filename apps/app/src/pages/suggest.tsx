import { Grid, Overlay } from '@mantine/core'
import { type GetServerSidePropsContext } from 'next'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

import { trpcServerClient } from '@weareinreach/api/trpc'
import { getServerSession } from '@weareinreach/auth'
import { SuggestOrg } from '@weareinreach/ui/components/sections/SuggestOrg'
import { QuickPromotionModal } from '@weareinreach/ui/modals'
import { getServerSideTranslations } from '~app/utils/i18n'

const SuggestResource = () => {
	const { data: session, status } = useSession()
	const [overlay, setOverlay] = useState(status === 'unauthenticated')

	useEffect(() => {
		if (!session && status === 'unauthenticated') {
			setOverlay(true)
		} else if (session && status === 'authenticated') {
			setOverlay(false)
		}
	}, [session, status])

	return (
		<>
			<Grid.Col sm={8}>
				<SuggestOrg />
			</Grid.Col>
			{overlay && (
				<Overlay blur={2}>
					<QuickPromotionModal autoLaunch noClose />
				</Overlay>
			)}
		</>
	)
}

export default SuggestResource

export const getServerSideProps = async ({ locale, req, res }: GetServerSidePropsContext) => {
	const session = await getServerSession({ req, res })
	const ssg = await trpcServerClient({ session })

	await ssg.organization.suggestionOptions.prefetch()

	return {
		props: {
			trpcState: ssg.dehydrate(),
			...(await getServerSideTranslations(locale, [
				'suggestOrg',
				'country',
				'services',
				'attribute',
				'common',
			])),
		},
	}
}
