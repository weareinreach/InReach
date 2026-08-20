import { Grid, Overlay } from '@mantine/core'
import { type GetStaticProps } from 'next'
import dynamic from 'next/dynamic'
import { useSession } from 'next-auth/react'
import { useCallback, useState } from 'react'

import { trpcServerClient } from '@weareinreach/api/trpc'
import { SuggestOrg } from '@weareinreach/ui/components/sections/SuggestOrg'
import { getServerSideTranslations } from '~app/utils/i18n'

const QuickPromotionModal = dynamic(
	// @ts-expect-error Next Dynamic doesn't like polymorphic components
	() => import('@weareinreach/ui/modals/QuickPromotion').then((mod) => mod.QuickPromotionModal),
	{ ssr: false }
)

const SuggestResource = () => {
	const { data: session, status } = useSession()
	const [overlay, setOverlay] = useState(false)
	const handleClose = useCallback(() => setOverlay(false), [setOverlay])

	return (
		<>
			<Grid.Col span={{ sm: 8 }}>
				<SuggestOrg
					authPromptState={{ overlay, setOverlay, hasAuth: Boolean(session && status === 'authenticated') }}
				/>
			</Grid.Col>
			{overlay && (
				<Overlay blur={2}>
					<QuickPromotionModal component='button' autoLaunch onClose={handleClose} />
				</Overlay>
			)}
		</>
	)
}

export default SuggestResource

export const getStaticProps: GetStaticProps = async ({ locale }) => {
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
