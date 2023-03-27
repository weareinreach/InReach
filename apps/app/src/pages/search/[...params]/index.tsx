/* eslint-disable i18next/no-literal-string */
import { Grid, Group } from '@mantine/core'
import { trpcServerClient, type ApiOutput } from '@weareinreach/api/trpc'
import { SearchResultCard, SearchBox, Pagination } from '@weareinreach/ui/components/core'
import { SearchResultSidebar } from '@weareinreach/ui/components/sections'
import { ServiceFilter } from '@weareinreach/ui/modals'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { type RoutedQuery } from 'nextjs-routes'
import { Suspense, useEffect, useState } from 'react'
import { z } from 'zod'

import { api } from '~app/utils/api'
import { SEARCH_RESULT_PAGE_SIZE, getSearchResultPageCount } from '~app/utils/constants'
import { getServerSideTranslations } from '~app/utils/i18n'

const ParamSchema = z.tuple([
	z.literal('dist'),
	z.coerce.number().gte(-180).lte(180).describe('longitude'),
	z.coerce.number().gte(-90).lte(90).describe('latitude'),
	z.coerce.number().describe('distance'),
	z.literal('mi').or(z.literal('km')).describe(`'mi' or 'km'`),
])
const PageIndexSchema = z.coerce.number().default(1)

const SearchResults = () => {
	const { query, locale } = useRouter<'/search/[...params]'>()
	const [filteredServices, setFilteredServices] = useState<string[]>([])
	const [filteredAttributes, setFilteredAttributes] = useState<string[]>([])
	const { t } = useTranslation(['services'])
	const queryParams = ParamSchema.safeParse(query.params)
	const skip = (PageIndexSchema.parse(query.page) - 1) * SEARCH_RESULT_PAGE_SIZE
	const take = SEARCH_RESULT_PAGE_SIZE

	const [error, setError] = useState(false)
	const [data, setData] = useState<ApiOutput['organization']['searchDistance']>()
	const [resultCount, setResultCount] = useState(0)

	if (!queryParams.success) setError(true)
	const [_searchType, lon, lat, dist, unit] = queryParams.success
		? queryParams.data
		: (['dist', 0, 0, 0, 'mi'] as const)
	const { isSuccess, ...searchQuery } = api.organization.searchDistance.useQuery(
		{
			lat,
			lon,
			dist,
			unit,
			skip,
			take,
			services: filteredServices,
			attributes: filteredAttributes,
		},
		{
			enabled: queryParams.success,
		}
	)
	useEffect(() => {
		if (searchQuery.data) {
			setResultCount(searchQuery.data.resultCount)
			setData(searchQuery.data)
		}
	}, [searchQuery.data])

	const resultList =
		data?.orgs && isSuccess
			? data.orgs.map((result) => {
					return <SearchResultCard key={result.id} result={result} />
			  })
			: null

	if (error) return <>Error</>

	return (
		<>
			<Grid.Col sm={12}>
				<Group spacing={20} noWrap w='100%'>
					<SearchBox type='location' />
					<ServiceFilter resultCount={resultCount} stateHandler={setFilteredServices} />
				</Group>
			</Grid.Col>
			<Grid.Col>
				<SearchResultSidebar resultCount={resultCount} stateHandler={setFilteredAttributes} />
			</Grid.Col>
			<Grid.Col sm={8}>
				{/* <Suspense fallback={<h1>Loader goes here</h1>}> */}
				{resultList}
				{/* </Suspense> */}
				<Pagination total={getSearchResultPageCount(data?.resultCount)} />
			</Grid.Col>
		</>
	)
}

export const getServerSideProps: GetServerSideProps<{}, RoutedQuery<'/search/[...params]'>> = async ({
	locale,
	query,
}) => {
	const [_searchType, lon, lat, dist, unit] = ParamSchema.parse(query.params)
	const skip = (PageIndexSchema.parse(query.page) - 1) * SEARCH_RESULT_PAGE_SIZE
	const take = SEARCH_RESULT_PAGE_SIZE
	const ssg = await trpcServerClient()
	const nextPage = PageIndexSchema.parse(query.page) * SEARCH_RESULT_PAGE_SIZE

	await ssg.organization.searchDistance.prefetch({ lat, lon, dist, unit, skip, take })
	await ssg.organization.searchDistance.prefetch({ lat, lon, dist, unit, skip: nextPage, take })
	await ssg.service.getFilterOptions.prefetch()
	await ssg.attribute.getFilterOptions.prefetch()

	const props = {
		trpcState: ssg.dehydrate(),
		...(await getServerSideTranslations(locale, ['services', 'common', 'attribute'])),
	}

	return {
		props,
	}
}

export default SearchResults
