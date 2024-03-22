/* eslint-disable i18next/no-literal-string */
import {
	Box,
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
import compare from 'just-compare'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Trans, useTranslation } from 'next-i18next'
import { type GetServerSideProps } from 'nextjs-routes'
import { type JSX, memo, useEffect, useMemo, useState } from 'react'
import { z } from 'zod'

import { SearchParamsSchema } from '@weareinreach/api/schemas/routes/search'
import { type ApiOutput, trpcServerClient } from '@weareinreach/api/trpc'
import { Pagination } from '@weareinreach/ui/components/core/Pagination'
import { SearchBox } from '@weareinreach/ui/components/core/SearchBox'
import { SearchResultCard } from '@weareinreach/ui/components/core/SearchResultCard'
import { CrisisSupport } from '@weareinreach/ui/components/sections/CrisisSupport'
import { SearchResultSidebar } from '@weareinreach/ui/components/sections/SearchResultSidebar'
import { useCustomVariant } from '@weareinreach/ui/hooks/useCustomVariant'
import { useSearchState } from '@weareinreach/ui/hooks/useSearchState'
import { api } from '~app/utils/api'
import { getSearchResultPageCount, SEARCH_RESULT_PAGE_SIZE } from '~app/utils/constants'
import { getServerSideTranslations } from '~app/utils/i18n'
import { Link } from '~ui/components/core/Link'
// import { MoreFilter } from '@weareinreach/ui/modals/MoreFilter'
// import { ServiceFilter } from '@weareinreach/ui/modals/ServiceFilter'

// @ts-expect-error Next Dynamic doesn't like polymorphic components
const MoreFilter = dynamic(() => import('@weareinreach/ui/modals/MoreFilter').then((mod) => mod.MoreFilter))
const ServiceFilter = dynamic(() =>
	import('@weareinreach/ui/modals/ServiceFilter').then((mod) => mod.ServiceFilter)
)

const stateRiskLevels = {
	FL: 'alerts.search-page-do-not-fly-florida',
	KS: 'alerts.search-page-high-risk-state',
	MT: 'alerts.search-page-high-risk-state',
	OK: 'alerts.search-page-high-risk-state',
	ND: 'alerts.search-page-high-risk-state',
	TN: 'alerts.search-page-high-risk-state',
	UT: 'alerts.search-page-high-risk-state',
	AL: 'alerts.search-page-high-risk-state',
	AR: 'alerts.search-page-high-risk-state',
	IA: 'alerts.search-page-high-risk-state',
	IN: 'alerts.search-page-high-risk-state',
	LA: 'alerts.search-page-high-risk-state',
	MO: 'alerts.search-page-high-risk-state',
	MS: 'alerts.search-page-high-risk-state',
	NE: 'alerts.search-page-high-risk-state',
	OH: 'alerts.search-page-high-risk-state',
	SC: 'alerts.search-page-high-risk-state',
	TX: 'alerts.search-page-high-risk-state',
	WV: 'alerts.search-page-high-risk-state',
	AK: 'alerts.search-page-med-risk-state',
	GA: 'alerts.search-page-med-risk-state',
	ID: 'alerts.search-page-med-risk-state',
	KY: 'alerts.search-page-med-risk-state',
	NC: 'alerts.search-page-med-risk-state',
	NH: 'alerts.search-page-med-risk-state',
	SD: 'alerts.search-page-med-risk-state',
	WY: 'alerts.search-page-med-risk-state',
	AZ: 'alerts.search-page-low-risk-state',
	DE: 'alerts.search-page-low-risk-state',
	ME: 'alerts.search-page-low-risk-state',
	MI: 'alerts.search-page-low-risk-state',
	NV: 'alerts.search-page-low-risk-state',
	PA: 'alerts.search-page-low-risk-state',
	RI: 'alerts.search-page-low-risk-state',
	VA: 'alerts.search-page-low-risk-state',
	WI: 'alerts.search-page-low-risk-state',
	CA: 'alerts.search-page-most-protective-state',
	CO: 'alerts.search-page-most-protective-state',
	CT: 'alerts.search-page-most-protective-state',
	DC: 'alerts.search-page-most-protective-state',
	HI: 'alerts.search-page-most-protective-state',
	IL: 'alerts.search-page-most-protective-state',
	MA: 'alerts.search-page-most-protective-state',
	MD: 'alerts.search-page-most-protective-state',
	MN: 'alerts.search-page-most-protective-state',
	NJ: 'alerts.search-page-most-protective-state',
	NM: 'alerts.search-page-most-protective-state',
	NY: 'alerts.search-page-most-protective-state',
	OR: 'alerts.search-page-most-protective-state',
	VT: 'alerts.search-page-most-protective-state',
	WA: 'alerts.search-page-most-protective-state',
}
const protectiveStates = [
	'CA',
	'CO',
	'CT',
	'DC',
	'HI',
	'IL',
	'MA',
	'MD',
	'MN',
	'NJ',
	'NM',
	'NY',
	'OR',
	'VT',
	'WA',
]

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
	searchBanner: {
		...theme.other.utilityFonts.utility1,
		color: theme.other.colors.secondary.black,
		width: '100%',
		maxWidth: '100%',
		height: rem(52),
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		textAlign: 'center',
		position: 'relative',
		borderRadius: rem(8),
		padding: `0 ${rem(16)}`,
		marginBottom: rem(32),
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
	emoji: {
		marginRight: rem(8), // Add margin to separate emoji from text
	},
}))

const highRiskStates = [
	'AL',
	'AR',
	'LA',
	'MO',
	'MS',
	'NE',
	'OH',
	'SC',
	'TX',
	'WV',
	'KS',
	'MT',
	'ND',
	'OK',
	'TN',
	'FL',
]
const medRiskStates = ['AK', 'GA', 'IA', 'ID', 'IN', 'KY', 'NC', 'SD', 'UT', 'WY']
const lowRiskStates = ['AZ', 'DE', 'ME', 'MI', 'NH', 'NV', 'PA', 'RI', 'VA', 'WI']

const SearchResults = () => {
	const router = useRouter<'/search/[...params]'>()
	const { searchState, searchStateActions } = useSearchState()
	const theme = useMantineTheme()
	const isTablet = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)

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
		Array.from({ length: 10 }, (x, i) => <SearchResultCard key={i} loading />)
	)
	const [loadingPage, setLoadingPage] = useState(false)

	if (!queryParams.success) setError(true)
	const [country, lon, lat, dist, unit] = queryParams.success
		? queryParams.data
		: (['US', 0, 0, 0, 'mi'] as const)
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
			...(searchState.services.length ? { services: searchState.services } : {}),
			...(searchState.attributes.length ? { attributes: searchState.attributes } : {}),
		},
		{
			enabled: queryParams.success,
		}
	)

	const { data: crisisResults } = api.organization.getNatlCrisis.useQuery({
		cca2: country,
	})

	const NoResults = memo(({ data }: { data: NonNullable<ApiOutput['organization']['getNatlCrisis']> }) => {
		return (
			<Stack className={classes.noResultsStack}>
				<Text>{t('common:search.no-results-adjust')}</Text>
				<CrisisSupport role='national'>
					{data.map((result) => (
						<CrisisSupport.National data={result} key={result.id} />
					))}
				</CrisisSupport>
			</Stack>
		)
	})
	NoResults.displayName = 'NoResults'

	useEffect(() => {
		if (loadingPage !== searchIsLoading) {
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

	const [stateInUS, setStateInUS] = useState<string>('')

	useEffect(() => {
		setStateInUS(searchState.searchTerm?.split(', ')[1] || '')
	}, [searchState.searchTerm])

	useEffect(
		() => {
			if (typeof router.query.page === 'string' && searchState.page !== router.query.page)
				searchStateActions.setPage(router.query.page)
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[router.query.page]
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
				...(searchState.services.length ? { services: searchState.services } : {}),
				...(searchState.attributes.length ? { attributes: searchState.attributes } : {}),
			})
		}
		if (queryParams.success && !compare(queryParams.data, searchState.params)) {
			searchStateActions.setParams(queryParams.data.map((x) => x.toString()))
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	if (error) return <>Error</>
	const showCountryAlertMessage = ['PW', 'AS', 'UM', 'MP', 'MH', 'US', 'VI', 'GU', 'PR'].includes(country)
	const showStateAlertMessage = true

	return (
		<>
			<Head>
				<title>{t('page-title.base', { ns: 'common', title: '$t(page-title.search-results)' })}</title>
			</Head>
			{showCountryAlertMessage && (
				<Box className={classes.banner}>
					<Text variant={variants.Text.utility1white}>
						<Trans
							i18nKey='alerts.search-page-legislative-map'
							ns='common'
							components={{
								ATLink: (
									<Link
										external
										variant={variants.Link.inheritStyle}
										href='https://www.erininthemorning.com/p/anti-trans-legislative-risk-assessment-96f'
										target='_blank'
									></Link>
								),
							}}
						/>
					</Text>
				</Box>
			)}

			{showStateAlertMessage && (
				<Box className={classes.banner}>
					<Text variant={variants.Text.utility1white}>
						<Trans
							i18nKey='alerts.search-page-legislative-map'
							ns='common'
							components={{
								ATLink: (
									<Link
										external
										variant={variants.Link.inheritStyle}
										href='https://www.erininthemorning.com/p/anti-trans-legislative-risk-assessment-96f'
										target='_blank'
									></Link>
								),
							}}
						/>
					</Text>
				</Box>
			)}

			<Grid.Col
				xs={12}
				sm={12}
				pb={30}
				{...(showCountryAlertMessage || showStateAlertMessage
					? { mt: { base: 80, xs: 80, sm: 20, md: 20, lg: 20, xl: 40 } }
					: {})}
			>
				<Group spacing={20} w='100%' className={classes.searchControls}>
					<Group maw={{ md: '50%', base: '100%' }} w='100%'>
						<SearchBox
							type='location'
							loadingManager={{ setLoading: setLoadingPage, isLoading: loadingPage }}
							initialValue={searchState.searchTerm}
							setSearchValue={(newValue: string) => {
								searchStateActions.setSearchTerm(newValue)
							}}
						/>
					</Group>
					<Group noWrap w={{ base: '100%', md: '50%' }}>
						<ServiceFilter
							resultCount={resultCount}
							isFetching={searchIsFetching}
							current={searchState.services}
						/>
						{/* @ts-expect-error `component` prop not needed.. */}
						<MoreFilter resultCount={resultCount} isFetching={searchIsFetching}>
							{t('more.filters')}
						</MoreFilter>
					</Group>
					{isTablet && (
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
				/>
			</Grid.Col>
			<>
				<Grid.Col xs={12} sm={8} md={8}>
					{data?.resultCount === 0 && crisisResults ? (
						<NoResults data={crisisResults} />
					) : (
						<>
							{stateRiskLevels[stateInUS] && (
								<div>
									<Box
										className={classes.searchBanner}
										style={{
											backgroundColor: protectiveStates.includes(stateInUS)
												? theme.other.colors.tertiary.lightGreen
												: theme.other.colors.tertiary.lightPink,
										}}
									>
										<div className={classes.emoji}>🔔</div>
										<Text variant={variants.Text.utility1}>
											<Trans
												i18nKey={stateRiskLevels[stateInUS]}
												ns='common'
												components={{
													ATLink: (
														<Link
															external
															variant={variants.Link.inheritStyle}
															href='https://www.erininthemorning.com/p/anti-trans-legislative-risk-assessment-96f'
															target='_blank'
														></Link>
													),
												}}
											/>
										</Text>
									</Box>
								</div>
							)}

							{resultDisplay}
							<Pagination total={getSearchResultPageCount(data?.resultCount)} />
						</>
					)}
				</Grid.Col>
			</>
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

	const [i18n] = await Promise.allSettled([
		getServerSideTranslations(locale, ['services', 'common', 'attribute']),
		ssg.organization.searchDistance.prefetch({ lat, lon, dist, unit, skip, take }),
		ssg.organization.getNatlCrisis.prefetch({ cca2: country }),
		ssg.service.getFilterOptions.prefetch(),
		ssg.attribute.getFilterOptions.prefetch(),
	])
	const props = {
		trpcState: ssg.dehydrate(),
		...(i18n.status === 'fulfilled' ? i18n.value : {}),
	}

	return {
		props,
	}
}

export default SearchResults
