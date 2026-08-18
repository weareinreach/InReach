/* eslint-disable i18next/no-literal-string */
import {
	createStyles,
	Divider,
	Grid,
	Group,
	rem,
	Skeleton,
	Stack,
	Text,
	useMantineTheme,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { getCookie } from 'cookies-next'
import compare from 'just-compare'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { type GetServerSideProps } from 'nextjs-routes'
import { type JSX, memo, useEffect, useMemo, useState } from 'react'
import { z } from 'zod'

import { searchBoxEvent } from '@weareinreach/analytics/events'
import { SearchParamsSchema } from '@weareinreach/api/schemas/routes/search'
import { type ApiOutput, trpcServerClient } from '@weareinreach/api/trpc'
import { LocationBasedAlertBanner } from '@weareinreach/ui/components/core/LocationBasedAlertBanner'
import { Pagination } from '@weareinreach/ui/components/core/Pagination'
import { SearchBox } from '@weareinreach/ui/components/core/SearchBox'
import { SearchResultCard } from '@weareinreach/ui/components/core/SearchResultCard'
import { CrisisSupport } from '@weareinreach/ui/components/sections/CrisisSupport'
import { useCustomVariant } from '@weareinreach/ui/hooks/useCustomVariant'
import { useSearchState } from '@weareinreach/ui/hooks/useSearchState'
import { api } from '~app/utils/api'
import { getSearchResultPageCount, SEARCH_RESULT_PAGE_SIZE } from '~app/utils/constants'
import { getServerSideTranslations } from '~app/utils/i18n'

interface SearchResultV2Metadata {
	relevanceScore?: number
	tier?: string
	isLocal?: boolean
}

// Both written by SearchResultSidebar.tsx as cookies (not localStorage) specifically so this
// page's getServerSideProps can read the same preference and prefetch focus-aware results
// server-side - a user who already has a preference set shouldn't need to wait for a client-side
// refetch to see it applied on a fresh page load.
const ACTIVE_FOCUSES_COOKIE = 'ir_active_focuses'
const FOCUS_ORDER_COOKIE = 'ir_focus_order'

const parseStringArray = (raw: string | undefined): string[] => {
	if (!raw) {
		return []
	}
	try {
		const parsed = JSON.parse(raw) as unknown
		return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []
	} catch {
		return []
	}
}

/**
 * Mirrors the reordering SearchResultSidebar.tsx applies: the saved order wins when it actually covers the
 * active set, otherwise fall back to the active set's own (unordered) sequence.
 */
const resolveOrderedFocuses = (rawActive: string | undefined, rawOrder: string | undefined): string[] => {
	const focuses = parseStringArray(rawActive)
	const order = parseStringArray(rawOrder)
	const orderedActive = order.filter((id) => focuses.includes(id))
	return orderedActive.length > 0 ? orderedActive : focuses
}

const RecommendedLinksModal = dynamic(
	// @ts-expect-error - Next Dynamic has trouble with polymorphic components
	() => import('@weareinreach/ui/modals/RecommendedLinks').then((mod) => mod.RecommendedLinksModal),
	{ ssr: false }
)
const MoreFilter = dynamic(() => import('@weareinreach/ui/modals/MoreFilter').then((mod) => mod.MoreFilter), {
	ssr: false,
})
const ServiceFilter = dynamic(
	() => import('@weareinreach/ui/modals/ServiceFilter').then((mod) => mod.ServiceFilter),
	{ ssr: false }
)
const SortResults = dynamic(
	() => import('@weareinreach/ui/components/sections/SortResults').then((mod) => mod.SortResults),
	{ ssr: false }
)
// Pulls in @dnd-kit/core + @dnd-kit/sortable for its drag-to-reorder focus list - real weight in
// the initial bundle for a secondary interaction most visitors won't use on a given visit.
const SearchResultSidebar = dynamic(
	() =>
		import('@weareinreach/ui/components/sections/SearchResultSidebar').then((mod) => mod.SearchResultSidebar),
	{ ssr: false }
)

const PageIndexSchema = z.coerce.number().default(1)

const useStyles = createStyles((theme) => ({
	searchControls: {
		flexWrap: 'wrap',
		flexDirection: 'column',
		[theme.fn.largerThan('sm')]: {
			flexWrap: 'nowrap',
			flexDirection: 'row',
		},
	},
	hideMobile: {
		[theme.fn.smallerThan('sm')]: {
			display: 'none',
		},
	},
	noResultsStack: {
		gap: rem(40),
		[theme.fn.largerThan('sm')]: {
			gap: rem(48),
		},
	},
	banner: {
		backgroundColor: theme.other.colors.secondary.cornflower,
		...theme.other.utilityFonts.utility1,
		color: theme.other.colors.secondary.white,
		width: '100vw',
		height: rem(52),
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		textAlign: 'center',
		position: 'absolute',
		[theme.fn.largerThan('sm')]: {
			marginTop: rem(-40),
		},
		[theme.fn.largerThan('xl')]: {
			marginTop: rem(-20),
		},
		[theme.fn.smallerThan('sm')]: {
			height: rem(80),
		},
	},
}))

const NoResults = memo(
	({ crisisData }: { crisisData: NonNullable<ApiOutput['organization']['getNatlCrisis']> }) => {
		const { classes } = useStyles()
		const { t } = useTranslation('common')
		return (
			<Stack className={classes.noResultsStack}>
				<Text>{t('search.no-results-adjust')}</Text>
				<CrisisSupport role='national'>
					{crisisData.map((result) => (
						<CrisisSupport.National data={result} key={result.id} />
					))}
				</CrisisSupport>
			</Stack>
		)
	}
)
NoResults.displayName = 'NoResults'

const SearchResults = () => {
	const router = useRouter<'/search/[...params]'>()
	const { searchState, searchStateActions } = useSearchState()
	const theme = useMantineTheme()
	const [mounted, setMounted] = useState(false)
	const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`)
	const isAdvanced = true
	// Lazy initializer (not useEffect) so this reads synchronously on the very first client render
	// instead of one render/effect cycle later - a user with a saved preference gets their (still
	// necessarily client-only, since this specific render pass is the first place `window` exists)
	// refetch kicked off immediately rather than after an extra tick. Safe from a hydration
	// mismatch: this only feeds the query input below, never rendered JSX/DOM directly.
	const [advancedParams, setAdvancedParams] = useState<{ focuses: string[] }>(() => ({
		focuses: resolveOrderedFocuses(getCookie(ACTIVE_FOCUSES_COOKIE), getCookie(FOCUS_ORDER_COOKIE)),
	}))

	useEffect(() => {
		setMounted(true)
		const updateAdvancedParams = () => {
			setAdvancedParams({
				focuses: resolveOrderedFocuses(getCookie(ACTIVE_FOCUSES_COOKIE), getCookie(FOCUS_ORDER_COOKIE)),
			})
		}

		window.addEventListener('ir_focus_changed', updateAdvancedParams)
		return () => {
			window.removeEventListener('ir_focus_changed', updateAdvancedParams)
		}
	}, [])

	const { t } = useTranslation(['services', 'common'])
	const queryParams = SearchParamsSchema.safeParse(router.query.params)
	const skip = (PageIndexSchema.parse(router.query.page) - 1) * SEARCH_RESULT_PAGE_SIZE
	const take = SEARCH_RESULT_PAGE_SIZE
	const apiUtils = api.useUtils()
	const { classes } = useStyles()
	const variants = useCustomVariant()

	const [error, setError] = useState(false)
	const [data, setData] = useState<ApiOutput['organization']['searchDistance']>()
	const [resultCount, setResultCount] = useState(0)
	const [resultDisplay, setResultDisplay] = useState<JSX.Element[]>(
		Array.from({ length: 10 }, (_x, i) => <SearchResultCard key={i} loading index={0} />)
	)
	const [loadingPage, setLoadingPage] = useState(false)

	if (!queryParams.success) {
		setError(true)
	}

	const [country, lon, lat, dist, unit] = queryParams.success
		? queryParams.data
		: (['US', 0, 0, 0, 'mi'] as const)

	const currentSortBias = (searchState as { sortBias?: 'DISTANCE' | 'RELEVANCE' }).sortBias

	const searchInput = useMemo(() => {
		const baseParams = {
			lat,
			lon,
			dist,
			unit,
			skip,
			take,
			...(searchState.services.length ? { services: searchState.services } : {}),
			...(searchState.attributes.length ? { attributes: searchState.attributes } : {}),
			// Omitted (not sent as an empty array) when there's nothing saved, matching services/
			// attributes above - this is what lets the common case (no saved focus preference)
			// match getServerSideProps's prefetch below instead of forcing a redundant refetch.
			...(advancedParams.focuses.length ? { focuses: advancedParams.focuses } : {}),
		}
		return {
			...baseParams,
			version: 'v3' as const,
			sortBias: currentSortBias,
		}
	}, [
		lat,
		lon,
		dist,
		unit,
		skip,
		take,
		searchState.services,
		searchState.attributes,
		currentSortBias,
		advancedParams.focuses,
	])

	const {
		isFetching: searchIsFetching,
		isLoading: searchIsLoading,
		...searchQuery
	} = api.organization.searchDistance.useQuery(searchInput, {
		enabled: queryParams.success,
	})

	const { data: crisisResults } = api.organization.getNatlCrisis.useQuery({ cca2: country })

	useEffect(() => {
		if (loadingPage !== searchIsLoading) setLoadingPage(searchIsLoading)
		if (searchQuery.data) {
			setResultCount(searchQuery.data.resultCount)
			setData(searchQuery.data)
			setLoadingPage(false)
			if (searchQuery.data.resultCount === 0) {
				searchBoxEvent.zeroResults(searchState.searchTerm ?? '', 'location', searchState.services[0] || 'all')
			} else {
				searchBoxEvent.searchExecuted({
					location: country,
					services: searchState.services,
					attributes: searchState.attributes,
					searchTerm: searchState.searchTerm,
					// Reads the actual version being queried (searchInput.version) rather than a
					// second hardcoded literal, so analytics can't silently drift out of sync with
					// which engine is really running - this exact drift is what happened before.
					version: searchInput.version,
					sortBias: currentSortBias,
					focuses: advancedParams.focuses,
				})
			}
		}
	}, [
		searchQuery.data,
		searchIsLoading,
		loadingPage,
		searchState.searchTerm,
		searchState.services,
		searchState.attributes,
		searchInput.version,
		country,
		currentSortBias,
		advancedParams.focuses,
	])

	useEffect(() => {
		if (data) {
			const renderedTiers = new Set<string>()
			const display = data.orgs.flatMap((result, index) => {
				const items: JSX.Element[] = []
				const currentTier = (result as SearchResultV2Metadata).tier

				// Inject tier header when moving between proximity zones in Advanced Search
				if (isAdvanced && currentTier && !renderedTiers.has(currentTier)) {
					renderedTiers.add(currentTier)
					const labelMap: Record<string, string> = {
						NEIGHBORHOOD: t('common:search.neighborhood-description'),
						LOCAL: t('common:search.local-description'),
						REGION: t('common:search.region-description'),
						EXTENDED_REGION: t('common:search.region-extended-description'),
						NATIONAL: t('common:search.remote-national-description'),
					}

					items.push(
						<Stack spacing={16} py={24} key={`tier-divider-${currentTier}`}>
							<Divider
								label={
									<Text variant={variants.Text.utility2darkGray} align='center' weight={600}>
										{labelMap[currentTier] || currentTier}
									</Text>
								}
								labelPosition='center'
							/>
						</Stack>
					)
				}

				items.push(
					<SearchResultCard
						key={result.id}
						result={result}
						loading={loadingPage}
						index={skip + index}
						isAdvanced={isAdvanced}
					/>
				)
				return items
			})
			setResultDisplay(display)
		}
	}, [data, loadingPage, skip, variants.Text.utility2darkGray, isAdvanced, t])

	useEffect(() => {
		if (typeof router.query.page === 'string' && searchState.page !== router.query.page) {
			searchStateActions.setPage(router.query.page)
		}
	}, [router.query.page, searchState.page, searchStateActions])

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
				version: 'v3' as const,
				sortBias: currentSortBias,
				skip: nextSkip,
				take,
				...(searchState.services.length ? { services: searchState.services } : {}),
				...(searchState.attributes.length ? { attributes: searchState.attributes } : {}),
				...(advancedParams.focuses.length ? { focuses: advancedParams.focuses } : {}),
			})
		}
	}, [
		data?.resultCount,
		router.query.page,
		isAdvanced,
		advancedParams.focuses,
		nextSkip,
		lat,
		lon,
		dist,
		unit,
		take,
		searchState.services,
		searchState.attributes,
		currentSortBias,
		apiUtils.organization.searchDistance,
	])

	useEffect(() => {
		if (queryParams.success && !compare(queryParams.data, searchState.params)) {
			searchStateActions.setParams(queryParams.data.map((x) => x.toString()))
		}
	}, [queryParams.data, queryParams.success, searchState, searchState.params, searchStateActions])

	if (error) return <>Error</>
	if (!mounted) {
		return null
	}

	const showAlertMessage = ['PW', 'AS', 'UM', 'MP', 'MH', 'US', 'VI', 'GU', 'PR'].includes(country)

	return (
		<>
			<Head>
				<title>{t('page-title.base', { ns: 'common', title: '$t(page-title.search-results)' })}</title>
			</Head>
			<RecommendedLinksModal component={'div'}>
				<LocationBasedAlertBanner lat={lat} lon={lon} type='primary' />
			</RecommendedLinksModal>
			<Grid.Col
				xs={12}
				sm={12}
				pb={30}
				{...(showAlertMessage ? { mt: { base: 80, xs: 80, sm: 20, md: 20, lg: 20, xl: 40 } } : {})}
			>
				<Group spacing={20} w='100%' className={classes.searchControls} align='flex-start'>
					<Stack spacing={8} maw={{ md: '50%', base: '100%' }} w='100%'>
						<SearchBox
							type='location'
							loadingManager={{ setLoading: setLoadingPage, isLoading: loadingPage }}
							initialValue={searchState.searchTerm}
						/>
					</Stack>
					<Stack spacing={16} align='flex-end' w={{ base: '100%', md: '50%' }}>
						<Group noWrap spacing={16} align='flex-end'>
							<ServiceFilter
								resultCount={resultCount}
								isFetching={searchIsFetching}
								current={searchState.services}
							/>
							{/* @ts-expect-error - Next Dynamic has trouble with polymorphic components */}
							<MoreFilter resultCount={resultCount} isFetching={searchIsFetching}>
								{t('more.filters')}
							</MoreFilter>
						</Group>
					</Stack>
					{isMobile && (
						<>
							<Divider w='100%' />
							<Skeleton visible={searchIsFetching}>
								<Text variant={variants.Text.utility1}>
									{t('common:count.result', { count: resultCount })}
								</Text>
							</Skeleton>
						</>
					)}
				</Group>
			</Grid.Col>
			<Grid.Col className={classes.hideMobile}>
				<SearchResultSidebar
					resultCount={resultCount}
					loadingManager={{ setLoading: setLoadingPage, isLoading: loadingPage }}
					isAdvanced={isAdvanced}
				/>
			</Grid.Col>
			<Grid.Col xs={12} sm={8} md={8}>
				{data?.resultCount === 0 && crisisResults ? (
					<NoResults crisisData={crisisResults} />
				) : (
					<>
						<LocationBasedAlertBanner lat={lat} lon={lon} type='secondary' />
						{isMobile && (
							<SortResults
								resultCount={resultCount}
								loadingManager={{ setLoading: setLoadingPage, isLoading: loadingPage }}
							>
								{t('common:sort.results')}
							</SortResults>
						)}
						{resultDisplay}
						<Pagination total={getSearchResultPageCount(data?.resultCount)} />
					</>
				)}
			</Grid.Col>
		</>
	)
}

export const getServerSideProps: GetServerSideProps<Record<string, unknown>, '/search/[...params]'> = async ({
	locale,
	query,
	req,
	res,
}) => {
	const [country, lon, lat, dist, unit] = SearchParamsSchema.parse(query.params)
	const skip = (PageIndexSchema.parse(query.page) - 1) * SEARCH_RESULT_PAGE_SIZE
	const take = SEARCH_RESULT_PAGE_SIZE
	const ssg = await trpcServerClient({ req, res })
	// Mirrors the client's own query input exactly (packages/ui/components/sections/
	// SearchResultSidebar.tsx writes these same cookies) so a user who already has a focus
	// preference set gets it applied in this server-rendered prefetch too, not just after a
	// client-side refetch - and so a user with nothing saved gets a prefetch that matches what
	// the client will ask for, instead of the two silently diverging.
	const focuses = resolveOrderedFocuses(
		getCookie(ACTIVE_FOCUSES_COOKIE, { req, res }),
		getCookie(FOCUS_ORDER_COOKIE, { req, res })
	)

	const [i18n] = await Promise.allSettled([
		getServerSideTranslations(locale, ['services', 'common', 'attribute', 'user']),
		ssg.organization.searchDistance.prefetch({
			lat,
			lon,
			dist,
			unit,
			skip,
			take,
			version: 'v3' as const,
			...(focuses.length ? { focuses } : {}),
		}),
		ssg.organization.getNatlCrisis.prefetch({ cca2: country }),
		ssg.service.getFilterOptions.prefetch(),
		ssg.attribute.getFilterOptions.prefetch(),
	])
	return { props: { trpcState: ssg.dehydrate(), ...(i18n.status === 'fulfilled' ? i18n.value : {}) } }
}

export default SearchResults
