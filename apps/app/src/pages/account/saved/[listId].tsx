import { Center, Grid, Loader, Overlay, Stack, Text, Title } from '@mantine/core'
import { type GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { useCallback } from 'react'
import { type JSX, memo, useEffect, useMemo, useState } from 'react'

import { getServerSession } from '@weareinreach/auth'
import { SearchResultCard } from '@weareinreach/ui/components/core/SearchResultCard'
import { api } from '~app/utils/api'
import { getServerSideTranslations } from '~app/utils/i18n'
// import { QuickPromotionModal } from '@weareinreach/ui/modals'

// @ts-expect-error Next Dynamic doesn't like polymorphic components
const QuickPromotionModal = dynamic(() =>
	import('@weareinreach/ui/modals/QuickPromotion').then((mod) => mod.QuickPromotionModal)
)
const SavedLists = () => {
	const { t } = useTranslation('common')
	const { data: session, status } = useSession()
	const router = useRouter<'/account/saved/[listId]'>()
	const { listId } = router.query
	const handleReturnHome = useCallback(() => router.replace('/'), [router])
	const { data } = api.savedList.getById.useQuery({ id: listId ?? '' }, { enabled: !!listId })

	// const [resultDisplay, setResultDisplay] = useState<JSX.Element[]>(
	// 	Array.from({ length: 10 }, (_x, i) => <SearchResultCard key={i} loading />)
	// )

	// useEffect(() => {
	// 	if (data) {
	// 		setResultDisplay(
	// 			data.organizations.map((result) => {
	// 				return <SearchResultCard key={result.description.id} result={result} loading={false} />
	// 			})
	// 		)
	// 	}
	// }, [data])

	if (status === 'loading') {
		return (
			<Center>
				<Loader />
			</Center>
		)
	}
	if (status === 'unauthenticated' || session === null) {
		return (
			<Overlay blur={2}>
				<QuickPromotionModal component='button' autoLaunch onClose={handleReturnHome} />
			</Overlay>
		)
	}

	return (
		<Grid.Col xs={12} sm={12}>
			<Stack h='100vh' align='flex-start' w='100%'>
				<Title order={2}>We're showing stuff for list id: {listId}</Title>
				<pre>{JSON.stringify(data, null, 2)}</pre>
			</Stack>
		</Grid.Col>
	)
}

export const getServerSideProps: GetServerSideProps = async ({ locale, req, res }) => {
	const session = await getServerSession({ req, res })

	return {
		props: {
			session,
			...(await getServerSideTranslations(locale, ['common', 'attribute'])),
		},
	}
}
export default SavedLists
