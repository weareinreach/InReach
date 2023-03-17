/* eslint-disable i18next/no-literal-string */
import { Grid, Group } from '@mantine/core'
import { trpcServerClient } from '@weareinreach/api/trpc'
import { SearchResultCard, SearchBox } from '@weareinreach/ui/components/core'
import { SearchResultSidebar } from '@weareinreach/ui/components/sections'
import { ServiceFilter } from '@weareinreach/ui/modals'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { type RoutedQuery } from 'nextjs-routes'
import { Suspense } from 'react'
import { z } from 'zod'

import { api } from '~app/utils/api'
import { getServerSideTranslations } from '~app/utils/i18n'

const ParamSchema = z.tuple([
	z.literal('dist'),
	z.coerce.number().gte(-180).lte(180).describe('longitude'),
	z.coerce.number().gte(-90).lte(90).describe('latitude'),
	z.coerce.number().describe('distance'),
	z.literal('mi').or(z.literal('km')).describe(`'mi' or 'km'`),
])

const SearchResults = () => {
	const { query, locale } = useRouter<'/search/[...params]'>()
	const queryClient = api.useContext()
	const { t } = useTranslation(['services'])
	const queryParams = ParamSchema.safeParse(query.params)

	if (!queryParams.success) return <>Error</>

	const [_searchType, lon, lat, dist, unit] = queryParams.data
	const { data, isSuccess } = api.organization.searchDistance.useQuery({ lat, lon, dist, unit })

	const resultList =
		data?.orgs && isSuccess
			? data.orgs.map((result) => {
					return <SearchResultCard key={result.id} result={result} />
			  })
			: null

	return (
		<>
			<Grid.Col sm={12}>
				<Group spacing={20} noWrap w='100%'>
					<SearchBox type='location' /> <ServiceFilter resultCount={resultList?.length} />
				</Group>
			</Grid.Col>
			<Grid.Col>
				<SearchResultSidebar resultCount={resultList?.length} />
			</Grid.Col>
			<Grid.Col sm={8}>
				<Suspense fallback={<h1>Loader goes here</h1>}>{resultList}</Suspense>
			</Grid.Col>
		</>
	)
}

export const getServerSideProps: GetServerSideProps<{}, RoutedQuery<'/search/[...params]'>> = async ({
	locale,
	query,
}) => {
	const [_searchType, lon, lat, dist, unit] = ParamSchema.parse(query.params)

	const ssg = await trpcServerClient()

	await ssg.organization.searchDistance.prefetch({ lat, lon, dist, unit })

	const props = {
		trpcState: ssg.dehydrate(),
		...(await getServerSideTranslations(locale, ['services', 'common', 'attribute'])),
	}

	return {
		props,
	}
}

export default SearchResults
