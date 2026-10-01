import { Divider, Grid, Group, Skeleton, Stack, Text, Title, useMantineTheme } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { type GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { type RoutedQuery } from 'nextjs-routes'
import { useEffect, useState } from 'react'
import { z } from 'zod'

import { trpcServerClient } from '@weareinreach/api/trpc'
import { SearchBox } from '@weareinreach/ui/components/core/SearchBox'
import { CrisisSupport } from '@weareinreach/ui/components/sections/CrisisSupport'
import { SearchResultSidebar } from '@weareinreach/ui/components/sections/SearchResultSidebar'
import { useCustomVariant } from '@weareinreach/ui/hooks/useCustomVariant'
import { api } from '~app/utils/api'
import { getServerSideTranslations } from '~app/utils/i18n'

import classes from './[country].module.css'

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

const QuerySchema = z.object({ country: z.string().length(2) })

const notBlank = (value?: string): value is string => !!value && value.length > 0

const OutsideServiceArea = () => {
	const [loading, setLoading] = useState(false)
	const [mounted, setMounted] = useState(false)
	const variants = useCustomVariant()
	const theme = useMantineTheme()
	const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`)
	const isAdvanced = true
	const router = useRouter<'/search/intl/[country]'>()

	// Single source of truth for the normalized code, reused everywhere below - `proxy.ts` already
	// redirects a mistyped-case URL to the canonical uppercase form before this page ever renders
	// (see #2067), but this stays case-safe and blank-safe on its own too rather than depending on
	// that redirect alone for correctness.
	const countryCode =
		typeof router.query.country === 'string' ? router.query.country.toUpperCase() : undefined

	useEffect(() => {
		setMounted(true)
		if (!router.isReady && !loading) {
			setLoading(true)
		} else if (router.isReady && loading) {
			setLoading(false)
		}
	}, [router.isReady, loading])

	useEffect(() => {
		if (mounted && router.isReady && countryCode && ['US', 'CA', 'MX'].includes(countryCode)) {
			void router.replace({
				pathname: '/search/[...params]',
				query: { params: [countryCode, '0', '0', '0', 'mi'] },
			})
		}
	}, [mounted, router.isReady, countryCode, router])

	const { data } = api.organization.getIntlCrisis.useQuery(
		{ cca2: countryCode ?? '' },
		{ enabled: notBlank(countryCode) }
	)
	useEffect(() => {
		if (data) {
			setLoading(false)
		}
	}, [data])
	const { t } = useTranslation(['services', 'common', 'attribute'])
	const countryTranslate = new Intl.DisplayNames(router.locale, { type: 'region' })

	const resultCount = 0

	if (!mounted) {
		return null
	}

	return (
		<>
			<Head>
				<title>{t('page-title.base', { ns: 'common', title: '$t(page-title.search-results)' })}</title>
			</Head>
			<Grid.Col span={{ base: 12, sm: 12 }} pb={30}>
				<Group gap={20} w='100%' className={classes.searchControls}>
					<Group maw={{ md: '50%', base: '100%' }} w='100%'>
						<SearchBox type='location' loadingManager={{ setLoading, isLoading: loading }} />
					</Group>
					<Group wrap='nowrap' w={{ base: '100%', md: '50%' }}>
						<ServiceFilter resultCount={resultCount} isFetching={false} disabled />
						{/* @ts-expect-error `component` prop not needed.. */}
						<MoreFilter resultCount={resultCount} isFetching={false} disabled>
							{t('more.filters')}
						</MoreFilter>
					</Group>
					{isMobile && (
						<>
							<Divider w='100%' />
							<Skeleton visible={typeof resultCount !== 'number'}>
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
					loadingManager={{ setLoading, isLoading: loading }}
					isAdvanced={isAdvanced}
				/>
			</Grid.Col>
			<Grid.Col span={{ base: 12, sm: 8, md: 8 }}>
				<Stack gap={48}>
					<Stack gap={16}>
						<Title order={2}>
							<Skeleton visible={loading}>
								{t('common:crisis-support.outside-service-area', {
									// `Intl.DisplayNames.of()` requires an uppercase region code and throws for a
									// blank one (confirmed directly: `.of('')` throws `invalid_argument`,
									// `.of('de')` silently returns 'de' instead of resolving it) - `countryCode` is
									// already uppercase, so only the blank case needs guarding here.
									country: notBlank(countryCode) ? countryTranslate.of(countryCode) : '',
								})}
							</Skeleton>
						</Title>
						{isMobile && (
							<SortResults
								resultCount={resultCount}
								loadingManager={{ setLoading, isLoading: loading }}
								disabled={resultCount === 0}
							>
								{t('common:sort.results')}
							</SortResults>
						)}
					</Stack>
					<Skeleton visible={loading}>
						<CrisisSupport role='international'>
							{data?.map((resource) => (
								<CrisisSupport.International data={resource} key={resource.id} />
							))}
						</CrisisSupport>
					</Skeleton>
				</Stack>
			</Grid.Col>
		</>
	)
}
// Server-rendered (not statically generated) specifically to avoid a Next.js framework bug: when
// a dynamic route param's value case-insensitively matches one of this app's configured locales
// (e.g. country "ES" vs. locale "es" - also affects FR/AR/IT/PL/PT/RU), Next's internal
// locale-detection logic throws "Invariant: The detected locale does not match the locale in the
// query" during static-page background revalidation (vercel/next.js#65167, closed "not planned").
// SSR bypasses that code path entirely since there's no static generation/revalidation involved.
export const getServerSideProps: GetServerSideProps<
	Record<string, unknown>,
	RoutedQuery<'/search/intl/[country]'>
> = async ({ params, locale }) => {
	const parsedQuery = QuerySchema.safeParse(params)
	if (!parsedQuery.success) {
		return {
			notFound: true,
		}
	}

	const ssg = await trpcServerClient({ session: null })
	const [i18n] = await Promise.allSettled([
		getServerSideTranslations(locale, ['services', 'common', 'attribute', 'user']),
		ssg.organization.getIntlCrisis.prefetch({ cca2: parsedQuery.data.country }),
	])
	const props = {
		trpcState: ssg.dehydrate(),
		...(i18n.status === 'fulfilled' ? i18n.value : {}),
	}

	return { props }
}

OutsideServiceArea.autoResetState = true
export default OutsideServiceArea
