/* eslint-disable i18next/no-literal-string */
import { Grid, Group, Space } from '@mantine/core'
import compare from 'just-compare'
import { type GetServerSideProps } from 'next'
import Head from 'next/head'
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
import { MoreFilter } from '@weareinreach/ui/modals/MoreFilter'
import { ServiceFilter } from '@weareinreach/ui/modals/ServiceFilter'
import { useSearchState } from '@weareinreach/ui/providers/SearchState'
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
	const { searchParams, routeActions } = useSearchState()

	useEffect(() => {
		routeActions.setSearchState(router.query)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

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
	const {
		isSuccess,
		isFetching: searchIsFetching,
		isLoading: searchIsLoading,
		...searchQuery
	} = api.organization.searchDistance.useQuery(
		{
			lat,
			lon,
			dist,
			unit,
			skip,
			take,
			services: filteredServices.length ? filteredServices : undefined,
			attributes: filteredAttributes.length ? filteredAttributes : undefined,
		},
		{
			enabled: queryParams.success,
		}
	)

	useEffect(() => {
		if (loadingPage !== searchIsLoading) {
			console.log('setLoading', searchIsLoading)
			setLoadingPage(searchIsLoading)
		}
		if (searchQuery.data) {
			setResultCount(searchQuery.data.resultCount)
			setData(searchQuery.data)
			setLoadingPage(false)
		}
	}, [searchQuery.data, searchIsLoading, loadingPage])

	useEffect(() => {
		if (data) {
			setResultDisplay(
				data.orgs.map((result) => {
					return <SearchResultCard key={result.id} result={result} loading={loadingPage} />
				})
			)
		}
	}, [data, loadingPage])

	useEffect(
		() => {
			switch (true) {
				case !compare(searchParams.searchState.a, filteredAttributes) &&
					!compare(searchParams.searchState.s, filteredServices): {
					routeActions.setSearchState({
						...searchParams.searchState,
						a: filteredAttributes,
						s: filteredServices,
					})
					break
				}
				case !compare(searchParams.searchState.a, filteredAttributes): {
					routeActions.setAttributes(filteredAttributes)
					break
				}

				case !compare(searchParams.searchState.s, filteredServices): {
					routeActions.setServices(filteredServices)
					break
				}
				case searchParams.searchState.page !== router.query.page: {
					if (typeof router.query.page === 'string') routeActions.setPage(router.query.page)
					break
				}
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[filteredAttributes, filteredServices, router.query.page]
	)

	const nextSkip = useMemo(
		() => PageIndexSchema.parse(router.query.page) * SEARCH_RESULT_PAGE_SIZE,
		[router.query.page]
	)
	useEffect(() => {
		if (
			router.query.page &&
			PageIndexSchema.parse(router.query.page) < getSearchResultPageCount(data?.resultCount)
		) {
			apiUtils.organization.searchDistance.prefetch({
				lat,
				lon,
				dist,
				unit,
				skip: nextSkip,
				take,
				...(filteredServices.length ? { services: filteredServices } : {}),
				...(filteredAttributes.length ? { attributes: filteredAttributes } : {}),
			})
		}
	})

	if (error) return <>Error</>

	return (
		<>
			<Head>
				<title>{t('page-title.base', { ns: 'common', title: '$t(page-title.search-results)' })}</title>
			</Head>
			<Grid.Col sm={12} pb={30}>
				<Group spacing={20} noWrap w='100%'>
					<SearchBox
						type='location'
						loadingManager={{ setLoading: setLoadingPage, isLoading: loadingPage }}
						initialValue={searchParams.searchTerm}
					/>
					<ServiceFilter
						resultCount={resultCount}
						stateHandler={setFilteredServices}
						isFetching={searchIsFetching}
					/>
					<MoreFilter
						resultCount={resultCount}
						stateHandler={setFilteredAttributes}
						isFetching={searchIsFetching}
					>
						{t('more.filters')}
					</MoreFilter>
				</Group>
			</Grid.Col>
			<Grid.Col>
				<SearchResultSidebar
					resultCount={resultCount}
					loadingManager={{ setLoading: setLoadingPage, isLoading: loadingPage }}
				/>
			</Grid.Col>
			<Grid.Col sm={8}>
				{resultDisplay}
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
	// const nextPage = PageIndexSchema.parse(query.page) * SEARCH_RESULT_PAGE_SIZE

	const [i18n] = await Promise.allSettled([
		getServerSideTranslations(locale, ['services', 'common', 'attribute']),
		ssg.organization.searchDistance.prefetch({ lat, lon, dist, unit, skip, take }),
		// await ssg.organization.searchDistance.prefetch({ lat, lon, dist, unit, skip: nextPage, take })
		ssg.service.getFilterOptions.prefetch(),
		ssg.attribute.getFilterOptions.prefetch(),
	])

	const props = {
		trpcState: ssg.dehydrate(),
		// ...(await getServerSideTranslations(locale, ['services', 'common', 'attribute'])),
		...i18n,
	}

	return {
		props,
	}
}

export default SearchResults
