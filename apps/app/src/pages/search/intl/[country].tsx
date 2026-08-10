import {
	Button,
	createStyles,
	Divider,
	Drawer,
	Grid,
	Group,
	rem,
	Skeleton,
	Stack,
	Text,
	Title,
	useMantineTheme,
} from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { type GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
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

const MoreFilter = dynamic(() => import('@weareinreach/ui/modals/MoreFilter').then((mod) => mod.MoreFilter))
const ServiceFilter = dynamic(() =>
	import('@weareinreach/ui/modals/ServiceFilter').then((mod) => mod.ServiceFilter)
)
const SortResults = dynamic(() =>
	import('@weareinreach/ui/components/sections/SortResults').then((mod) => mod.SortResults)
)
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
	parentCard: {
		background: theme.other.colors.tertiary.yellow,
	},
	categoryBadge: {
		background: theme.other.colors.secondary.white,
	},
	staySafeCard: {
		border: `${rem(1)} solid ${theme.other.colors.secondary.white}`,
		borderRadius: rem(16),
	},
	getHelpCard: {
		border: `${rem(1)} solid ${theme.other.colors.tertiary.coolGray}`,
		borderRadius: rem(16),
	},
	cardShadow: {
		boxShadow: `${rem(0)} ${rem(4)} ${rem(20)} ${rem(0)} rgba(0, 0, 0, 0.1)`,
	},
}))

const QuerySchema = z.object({ country: z.string().length(2) })

const notBlank = (value?: string) => !!value && value.length > 0

const OutsideServiceArea = () => {
	const [loading, setLoading] = useState(false)
	const [mounted, setMounted] = useState(false)
	const { classes } = useStyles()
	const variants = useCustomVariant()
	const theme = useMantineTheme()
	const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`)
	const isAdvanced = true
	const router = useRouter<'/search/intl/[country]'>()

	useEffect(() => {
		setMounted(true)
		if (!router.isReady && !loading) {
			setLoading(true)
		} else if (router.isReady && loading) {
			setLoading(false)
		}
	}, [router.isReady, loading])

	useEffect(() => {
		if (mounted && router.isReady && typeof router.query.country === 'string') {
			const country = router.query.country.toUpperCase()
			if (['US', 'CA', 'MX'].includes(country)) {
				void router.replace({
					pathname: '/search/[...params]',
					query: { params: [country, '0', '0', '0', 'mi'] },
				})
			}
		}
	}, [mounted, router.isReady, router.query.country, router])

	const { data } = api.organization.getIntlCrisis.useQuery(
		{ cca2: router.query.country ?? '' },
		{ enabled: notBlank(router.query.country), onSuccess: () => setLoading(false) }
	)
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
			<Grid.Col xs={12} sm={12} pb={30}>
				<Group spacing={20} w='100%' className={classes.searchControls}>
					<Group maw={{ md: '50%', base: '100%' }} w='100%'>
						<SearchBox type='location' loadingManager={{ setLoading, isLoading: loading }} />
					</Group>
					<Group noWrap w={{ base: '100%', md: '50%' }}>
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
			<Grid.Col xs={12} sm={8} md={8}>
				<Stack spacing={48}>
					<Stack spacing={16}>
						<Title order={2}>
							<Skeleton visible={loading}>
								{t('common:crisis-support.outside-service-area', {
									country: countryTranslate.of(router.query.country ?? ''),
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
							{data?.map((resource) => <CrisisSupport.International data={resource} key={resource.id} />)}
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
