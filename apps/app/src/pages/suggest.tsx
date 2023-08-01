import { Grid, Overlay } from '@mantine/core'
import { type GetStaticPropsContext } from 'next'
import { useSession } from 'next-auth/react'
import { useState } from 'react'

import { trpcServerClient } from '@weareinreach/api/trpc'
import { SuggestOrg } from '@weareinreach/ui/components/sections/SuggestOrg'
import { QuickPromotionModal } from '@weareinreach/ui/modals'
import { getServerSideTranslations } from '~app/utils/i18n'

const SuggestResource = () => {
	const { data: session, status } = useSession()
	const [overlay, setOverlay] = useState(false)

	return (
		<>
			<Grid.Col sm={8}>
				<SuggestOrg
					authPromptState={{ overlay, setOverlay, hasAuth: Boolean(session && status === 'authenticated') }}
				/>
			</Grid.Col>
			{overlay && (
				<Overlay blur={2}>
					<QuickPromotionModal autoLaunch onClose={() => setOverlay(false)} />
				</Overlay>
			)}
		</>
	)
}

export default SuggestResource

export const getStaticProps = async ({ locale }: GetStaticPropsContext) => {
	const ssg = await trpcServerClient({ session: null })

	const [i18n] = await Promise.allSettled([
		getServerSideTranslations(locale, ['suggestOrg', 'services', 'attribute', 'common']),
		ssg.organization.suggestionOptions.prefetch(),
	])

	return {
		props: {
			trpcState: ssg.dehydrate(),
			...(i18n.status === 'fulfilled' ? i18n.value : {}),
		},
		revalidate: 60 * 60 * 24, // 24 hours
	}
}
