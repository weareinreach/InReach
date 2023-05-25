/* eslint-disable i18next/no-literal-string */
import { Grid, Group, Space } from '@mantine/core'
import { type GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { type RoutedQuery } from 'nextjs-routes'
import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'

import { type ApiOutput, trpcServerClient } from '@weareinreach/api/trpc'
import { Pagination } from '@weareinreach/ui/components/core/Pagination'
import { SearchBox } from '@weareinreach/ui/components/core/SearchBox'
import { SearchResultCard } from '@weareinreach/ui/components/core/SearchResultCard'
import { SearchResultSidebar } from '@weareinreach/ui/components/sections/SearchResultSidebar'
import { ServiceFilter } from '@weareinreach/ui/modals/ServiceFilter'
import { api } from '~app/utils/api'
import { getSearchResultPageCount, SEARCH_RESULT_PAGE_SIZE } from '~app/utils/constants'
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
	const router = useRouter<'/search/[...params]'>()
	const [filteredServices, setFilteredServices] = useState<string[]>([])
	const [filteredAttributes, setFilteredAttributes] = useState<string[]>([])
	const { t } = useTranslation(['services'])
	const queryParams = ParamSchema.safeParse(router.query.params)
	const skip = (PageIndexSchema.parse(router.query.page) - 1) * SEARCH_RESULT_PAGE_SIZE
	const take = SEARCH_RESULT_PAGE_SIZE
	const apiUtils = api.useContext()

	const [error, setError] = useState(false)
	const [data, setData] = useState<ApiOutput['organization']['searchDistance']>()
	const [resultCount, setResultCount] = useState(0)
	const [resultDisplay, setResultDisplay] = useState<JSX.Element[]>(
		Array.from({ length: 10 }, (x, i) => <SearchResultCard key={i} loading />)
	)
	const [loadingPage, setLoadingPage] = useState(false)

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
			setLoadingPage(false)
		}
	}, [searchQuery.data])

	useEffect(() => {
		if (data) {
			setResultDisplay(
				data.orgs.map((result) => {
					return <SearchResultCard key={result.id} result={result} />
				})
			)
		}
	}, [data])

	const nextSkip = useMemo(
		() => PageIndexSchema.parse(router.query.page) * SEARCH_RESULT_PAGE_SIZE,
		[router.query.page]
	)
	useEffect(() => {
		if (
			router.query.page &&
			PageIndexSchema.parse(router.query.page) < getSearchResultPageCount(data?.resultCount)
		) {
			console.log('prefetch')
			apiUtils.organization.searchDistance.prefetch({
				lat,
				lon,
				dist,
				unit,
				skip: nextSkip,
				take,
				services: filteredServices,
				attributes: filteredAttributes,
			})
		}
	})

	if (error) return <>Error</>

	return (
		<>
			<Grid.Col sm={12}>
				<Group spacing={20} noWrap w='100%'>
					<SearchBox
						type='location'
						loadingManager={{ setLoading: setLoadingPage, isLoading: loadingPage }}
					/>
					<ServiceFilter resultCount={resultCount} stateHandler={setFilteredServices} />
				</Group>
			</Grid.Col>
			<Grid.Col>
				<SearchResultSidebar
					resultCount={resultCount}
					stateHandler={setFilteredAttributes}
					loadingManager={{ setLoading: setLoadingPage, isLoading: loadingPage }}
				/>
			</Grid.Col>
			<Grid.Col sm={8}>
				{/* <Suspense fallback={<h1>Loader goes here</h1>}> */}
				{resultDisplay}
				{/* </Suspense> */}
				<Pagination total={getSearchResultPageCount(data?.resultCount)} />
				<Space h={40} />
			</Grid.Col>
		</>
	)
}

export const getServerSideProps: GetServerSideProps<
	Record<string, unknown>,
	RoutedQuery<'/search/[...params]'>
> = async ({ locale, query, req, res }) => {
	const [_searchType, lon, lat, dist, unit] = ParamSchema.parse(query.params)
	const skip = (PageIndexSchema.parse(query.page) - 1) * SEARCH_RESULT_PAGE_SIZE
	const take = SEARCH_RESULT_PAGE_SIZE
	const ssg = await trpcServerClient({ req, res })
	const nextPage = PageIndexSchema.parse(query.page) * SEARCH_RESULT_PAGE_SIZE

	await ssg.organization.searchDistance.prefetch({ lat, lon, dist, unit, skip, take })
	// await ssg.organization.searchDistance.prefetch({ lat, lon, dist, unit, skip: nextPage, take })
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
