// import { type GetServerSideProps } from 'next'
import {
	Card,
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
import { Trans, useTranslation } from 'next-i18next'
import { type RoutedQuery } from 'nextjs-routes'
import { useEffect, useState } from 'react'
import { z } from 'zod'

import { type ApiOutput, trpcServerClient } from '@weareinreach/api/trpc'
import { Badge, BadgeGroup } from '@weareinreach/ui/components/core/Badge'
import { isExternal, Link } from '@weareinreach/ui/components/core/Link'
import { SearchBox } from '@weareinreach/ui/components/core/SearchBox'
import { useCustomVariant } from '@weareinreach/ui/hooks/useCustomVariant'
import { parsePhoneNumber } from '@weareinreach/ui/hooks/usePhoneNumber'
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

const OrgCard = ({ data }: { data: NonNullable<ApiOutput['organization']['getIntlCrisis']>[number] }) => {
	const { accessInstructions, description, id, name, services, targetPop } = data
	const theme = useMantineTheme()
	const { classes } = useStyles()
	const variant = useCustomVariant()
	const { t, ready } = useTranslation(['common', 'attribute', id])

	return (
		<Skeleton visible={!ready} radius={16}>
			<Card className={classes.cardShadow}>
				<Stack spacing={16}>
					{Boolean(services?.length) && (
						<BadgeGroup
							badges={services?.map(({ tsKey }, i) => ({
								variant: 'service',
								tsKey,
								hideTooltip: true,
								key: `${i}-${tsKey}`,
							}))}
						/>
					)}
					<Title order={2}>{name}</Title>
					{!!description.key && !!description.text && (
						<Text color={theme.other.colors.secondary.darkGray}>
							{t(description.key, { ns: id, defaultValue: description.text })}
						</Text>
					)}
					{!!targetPop?.tsKey && !!targetPop.text && (
						<Trans
							i18nKey='common:intl-crisis.who-this-serves'
							components={{ Text: <Text color={theme.other.colors.secondary.darkGray}></Text> }}
							t={t}
							// values={{ targetPop: `$t(${id}:${targetPop.tsKey}, {"defaultValue":"${targetPop.text}"})` }}
							values={{ targetPop: t(`${id}:${targetPop.tsKey}`, { defaultValue: targetPop.text }) }}
						/>
					)}
					{!!accessInstructions?.length && (
						<Stack spacing={12} p={16} className={classes.getHelpCard}>
							<Title order={3}>{t('common:service.get-help')}</Title>
							{accessInstructions.map(({ access_type, access_value }, i) => {
								const parseValue = () => {
									switch (access_type) {
										case 'email': {
											return (
												<Link
													href={`mailto:${access_value}`}
													external
													variant={variant.Link.inheritStyle}
													key={`${i}-${access_type}`}
												>
													{access_value}
												</Link>
											)
										}
										case 'link': {
											if (!isExternal(access_value)) return null
											const protocol = /^https?:\/\//i
											return (
												<Link
													href={access_value}
													external
													variant={variant.Link.inheritStyle}
													key={`${i}-${access_type}`}
												>
													{access_value.replace(protocol, '')}
												</Link>
											)
										}
										case 'phone': {
											const parsed = parsePhoneNumber(access_value, 'US')
											const linkHref = parsed?.getURI()
											if (!parsed || !isExternal(linkHref)) return null
											return (
												<Link
													href={linkHref}
													external
													variant={variant.Link.inheritStyle}
													key={`${i}-${access_type}`}
												>
													{parsed.formatInternational()}
												</Link>
											)
										}
									}
								}
								const getLabel = (accessType: typeof access_type) => {
									switch (accessType) {
										case 'email': {
											return t('common:words.email').toLowerCase()
										}
										case 'link': {
											return t('common:words.website').toLowerCase()
										}
										case 'phone': {
											return t('common:words.phone').toLowerCase()
										}
									}
								}

								return accessInstructions.length === 1 ? (
									parseValue()
								) : (
									<Stack spacing={0} key={`${i}-${access_type}`}>
										{parseValue()}
										<Text color={theme.other.colors.secondary.darkGray}>{getLabel(access_type)}</Text>
									</Stack>
								)
							})}
						</Stack>
					)}
				</Stack>
			</Card>
		</Skeleton>
	)
}

const OutsideServiceArea = () => {
	const [loading, setLoading] = useState(false)
	// const [filteredServices, setFilteredServices] = useState<string[]>([])
	// const [filteredAttributes, setFilteredAttributes] = useState<string[]>([])
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
		{ enabled: router.isReady }
	)
	const { data } = api.organization.getIntlCrisis.useQuery(
		{ cca2: router.query.country ?? '' },
		{ onSuccess: () => setLoading(false), enabled: router.isReady }
	)
	const { t } = useTranslation(['services', 'common', 'attribute', 'country'])

	const resultCount = 0

	if (loading) return null

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
							{t('intl-crisis.outside-service-area', {
								country: `$t(country:${countryInfo?.tsKey})`,
								ns: 'common',
							})}
						</Skeleton>
					</Title>
					<Card className={classes.parentCard}>
						<Stack spacing={32}>
							<Stack spacing={16}>
								<Badge
									variant='service'
									tsKey='international-support.CATEGORTYNAME'
									hideTooltip
									className={classes.categoryBadge}
								/>
								<Title order={2}>{t('common:intl-crisis.we-recommend')}</Title>
								<Text>{t('common:intl-crisis.these-verified')}</Text>
							</Stack>
							<Stack spacing={16} p={20} className={classes.staySafeCard}>
								<Trans
									i18nKey='common:intl-crisis.stay-safe'
									components={{ Title3: <Title order={3}></Title>, Text: <Text></Text> }}
								/>
							</Stack>
							{data?.map((resource) => (
								<OrgCard key={resource.id} data={resource} />
							))}
						</Stack>
					</Card>
				</Stack>
			</Grid.Col>
		</>
	)
}
export const getStaticPaths: GetStaticPaths = async () => {
	return {
		paths: [],
		fallback: true,
	}
}
export const getStaticProps = async ({
	params,
	locale,
}: GetStaticPropsContext<RoutedQuery<'/search/intl/[country]'>>) => {
	const parsedQuery = QuerySchema.safeParse(params)
	console.log(parsedQuery)
	if (!parsedQuery.success) {
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

export default OutsideServiceArea
