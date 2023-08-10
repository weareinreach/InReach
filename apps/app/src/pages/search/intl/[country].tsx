// import { type GetServerSideProps } from 'next'
import {
	createStyles,
	Divider,
	Grid,
	Group,
	rem,
	Skeleton,
	Stack,
	Text,
	Title,
	useMantineTheme,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { type GetStaticPaths, type GetStaticPropsContext } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { type RoutedQuery } from 'nextjs-routes'
import { useEffect, useState } from 'react'
import { z } from 'zod'

import { trpcServerClient } from '@weareinreach/api/trpc'
import { SearchBox } from '@weareinreach/ui/components/core/SearchBox'
import { CrisisSupport } from '@weareinreach/ui/components/sections/CrisisSupport'
import { useCustomVariant } from '@weareinreach/ui/hooks/useCustomVariant'
import { MoreFilter } from '@weareinreach/ui/modals/MoreFilter'
import { ServiceFilter } from '@weareinreach/ui/modals/ServiceFilter'
import { api } from '~app/utils/api'
import { getServerSideTranslations } from '~app/utils/i18n'
import { SearchResultSidebar } from '~ui/components/sections/SearchResultSidebar'

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
	const { classes } = useStyles()
	const variants = useCustomVariant()
	const theme = useMantineTheme()
	const isTablet = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)
	const router = useRouter<'/search/intl/[country]'>()

	useEffect(() => {
		if (!router.isReady && !loading) {
			setLoading(true)
		} else if (router.isReady && loading) {
			setLoading(false)
		}
	}, [router.isReady, router.isFallback, loading])

	const { data: countryInfo } = api.misc.getCountryTranslation.useQuery(
		{ cca2: router.query.country ?? '' },
		{ enabled: notBlank(router.query.country) }
	)
	const { data } = api.organization.getIntlCrisis.useQuery(
		{ cca2: router.query.country ?? '' },
		{ enabled: notBlank(router.query.country), onSuccess: () => setLoading(false) }
	)
	const { t } = useTranslation(['services', 'common', 'attribute', 'country'])

	const resultCount = 0

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
						<MoreFilter resultCount={resultCount} isFetching={false} disabled>
							{t('more.filters')}
						</MoreFilter>
					</Group>
					{isTablet && (
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
				<SearchResultSidebar resultCount={resultCount} loadingManager={{ setLoading, isLoading: loading }} />
			</Grid.Col>
			<Grid.Col xs={12} sm={8} md={8}>
				<Stack spacing={48}>
					<Title order={2}>
						<Skeleton visible={loading}>
							{t('common:crisis-support.outside-service-area', {
								country: `$t(country:${countryInfo?.tsKey})`,
							})}
						</Skeleton>
					</Title>
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
export const getStaticPaths: GetStaticPaths = async () => {
	return {
		paths: [],
		fallback: 'blocking',
	}
}
export const getStaticProps = async ({
	params,
	locale,
}: GetStaticPropsContext<RoutedQuery<'/search/intl/[country]'>>) => {
	const parsedQuery = QuerySchema.safeParse(params)
	console.log('getStaticProps -> parsedQuery', parsedQuery)
	console.log('getStaticProps -> params', {params, locale})
	if (!parsedQuery.success) {
		console.log('zod error', parsedQuery.error.flatten(), parsedQuery.error.toString())
		console.log('Redirecting to 404', { params, locale })
		return {
			notFound: true,
		}
	}

	const ssg = await trpcServerClient({ session: null })
	const [i18n] = await Promise.allSettled([
		getServerSideTranslations(locale, ['services', 'common', 'attribute', 'country']),
		ssg.misc.getCountryTranslation.prefetch({ cca2: parsedQuery.data.country }),
		ssg.organization.getIntlCrisis.prefetch({ cca2: parsedQuery.data.country }),
	])
	const props = {
		trpcState: ssg.dehydrate(),
		...(i18n.status === 'fulfilled' ? i18n.value : {}),
	}

	return {
		props,
		revalidate: 60 * 60 * 24 * 7, // 7 days
	}
}

OutsideServiceArea.autoResetState = true
export default OutsideServiceArea
