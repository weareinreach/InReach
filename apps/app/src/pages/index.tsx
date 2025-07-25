import { Carousel, type Embla, useAnimationOffsetEffect } from '@mantine/carousel'
import {
	Box,
	Card,
	Container,
	createStyles,
	Grid,
	Group,
	rem,
	Stack,
	Text,
	Title,
	useMantineTheme,
} from '@mantine/core'
import { getCookie } from 'cookies-next'
import Autoplay from 'embla-carousel-autoplay'
import { type GetStaticProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { type TFunction, Trans, useTranslation } from 'next-i18next'
import { useEffect, useRef, useState } from 'react'

import { donateEvent } from '@weareinreach/analytics/events'
import { ms } from '@weareinreach/api/lib/milliseconds'
import { trpcServerClient } from '@weareinreach/api/trpc'
import { AntiHatePopup } from '@weareinreach/ui/components/core/AntiHateMessage'
import { Link } from '@weareinreach/ui/components/core/Link'
import { UserReview } from '@weareinreach/ui/components/core/UserReview'
import { CallOut } from '@weareinreach/ui/components/sections/CallOut'
import { Hero } from '@weareinreach/ui/components/sections/Hero'
import { useCustomVariant } from '@weareinreach/ui/hooks/useCustomVariant'
import { AccountVerifyModal } from '@weareinreach/ui/modals/AccountVerified'
import { PrivacyStatementModal } from '@weareinreach/ui/modals/PrivacyStatement'
import { ResetPasswordModal } from '@weareinreach/ui/modals/ResetPassword'
import { api } from '~app/utils/api'
import { getServerSideTranslations } from '~app/utils/i18n'

import { type NextPageWithOptions } from './_app'

const useStyles = createStyles((theme) => ({
	callout1text: {
		color: theme.other.colors.secondary.white,
	},
	callout1font: {
		fontSize: rem(24),
		textAlign: 'center',
	},
	cardStack: {
		gap: rem(32),
		[theme.fn.largerThan('md')]: {
			gap: rem(40),
		},
	},
	cardLink: {
		// paddingTop: rem(8),
	},
	noHover: {
		'&hover': {
			backgroundColor: 'transparent !important',
		},
	},
	card: {
		minHeight: rem(198 + 24 + 24),
		borderRadius: rem(8),
		width: '100%',
		[theme.fn.largerThan('md')]: {
			maxWidth: '45%',
		},
	},
	cardGroup: {},
	reviewCard: {
		border: 'none !important',
	},
	banner: {
		backgroundColor: theme.other.colors.secondary.cornflower,
		...theme.other.utilityFonts.utility1,
		color: theme.other.colors.secondary.white,
		width: '100%',
		height: rem(52),
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		textAlign: 'center',
		[theme.fn.largerThan('sm')]: {
			marginTop: rem(-40),
		},
	},
}))

const useCarouselStyles = createStyles((theme) => ({
	indicators: {
		bottom: rem(-40),
		gap: rem(16),
		position: 'relative',
		marginBottom: rem(40),
	},
	indicator: {
		height: rem(12),
		width: rem(12),
		backgroundColor: theme.other.colors.secondary.black,
		opacity: 0.3,
		'&[data-active]': {
			opacity: 0.8,
		},
	},
	viewport: {
		borderRadius: rem(16),
		boxShadow: `${rem(0)} ${rem(8)} ${rem(24)} rgba(0, 0, 0, 0.1)`,
	},
	container: {
		maxWidth: rem(350),
		[theme.fn.largerThan('xs')]: {
			maxWidth: 'unset',
		},
	},
}))

const CardTranslation = ({ i18nKey, t }: { i18nKey: string; t: TFunction }) => {
	const variants = useCustomVariant()
	const linkProps = {
		external: true,
		variant: variants.Link.inlineUtil1,
	}

	return (
		<Trans
			i18nKey={i18nKey}
			t={t}
			ns='landingPage'
			components={{
				Title2: (
					<Title order={2} pb={16}>
						.
					</Title>
				),
				Text: <Text component='p'>.</Text>,
				LinkFree: (
					<Link
						href='https://inreach.kindful.com/?campaign=1274815'
						onClick={donateEvent.click}
						{...linkProps}
					>
						.
					</Link>
				),
				LinkInnovative: (
					<Link href='https://github.com/weareinreach?utm_source=inreach-app' {...linkProps}>
						.
					</Link>
				),
				LinkIntersect: (
					<Link href='https://inreach.org/vetting-process/' {...linkProps}>
						.
					</Link>
				),
				LinkSafety: <PrivacyStatementModal component={Link} {...linkProps}></PrivacyStatementModal>,
			}}
		/>
	)
}

const Home: NextPageWithOptions = () => {
	const router = useRouter()
	const { t } = useTranslation('landingPage')
	const theme = useMantineTheme()
	const variants = useCustomVariant()
	const { classes, cx } = useStyles()
	const { classes: carouselStyles } = useCarouselStyles()
	const { data: reviews } = api.review.getFeatured.useQuery(3, { staleTime: ms.minutes(2) })
	const [embla, setEmbla] = useState<Embla | null>(null)
	const autoplay = useRef(Autoplay({ delay: 5000 }))
	useAnimationOffsetEffect(embla, 5000)

	const launchAHpopup = getCookie('inr-ahpop')

	useEffect(() => {
		router.prefetch('/search/[...params]')
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<>
			<Head>
				<title>{t('inreach', { ns: 'common' })}</title>
			</Head>
			<Box className={classes.banner}>
				<Text variant={variants.Text.utility1white}>
					<Trans
						i18nKey='banner.tmf'
						ns='landingPage'
						components={{
							Link: (
								<Link
									external
									variant={variants.Link.inheritStyle}
									href='https://inreach.org/introducing-the-redesigned-inreach-app'
									// @ts-expect-error ignore the blank target error
									target='_blank'
								></Link>
							),
							DonateLink: (
								<Link
									external
									variant={variants.Link.inheritStyle}
									href='https://inreach.kindful.com/embeds/9e692b4a-fcfc-46a2-9a0e-4f9b8b0bd37b'
									// @ts-expect-error ignore the blank target error
									target='_blank'
								></Link>
							),
							TMFLink: (
								<Link
									external
									variant={variants.Link.inheritStyle}
									href='https://transmascfutures.inreach.org'
									// @ts-expect-error ignore the blank target error
									target='_blank'
								></Link>
							),
						}}
					/>
				</Text>
			</Box>
			<Container>
				<Hero />
			</Container>
			<CallOut backgroundColor={theme.other.colors.tertiary.darkBlue}>
				<Container>
					<Grid>
						<Grid.Col xs={12} sm={12} md={10} lg={8}>
							<Stack align='center' spacing={24}>
								<Trans
									i18nKey='call-out.who-we-are'
									t={t}
									ns='landingPage'
									components={{
										Title1: (
											<Title order={1} className={classes.callout1text}>
												.
											</Title>
										),
										Text: <Text className={cx(classes.callout1text, classes.callout1font)}>.</Text>,
										Link: (
											<Link
												external
												className={cx(classes.callout1text, classes.callout1font, classes.noHover)}
												href='https://www.inreach.org'
												variant={variants.Link.inline}
											>
												.
											</Link>
										),
									}}
								/>
							</Stack>
						</Grid.Col>
					</Grid>
				</Container>
			</CallOut>
			<CallOut backgroundColor={theme.other.colors.secondary.white}>
				<Container>
					<Grid>
						<Stack spacing={40} align='center'>
							<Title order={1} ta='center'>
								{t('values.our-values')}
							</Title>
							<Group spacing={40} position='center'>
								<Card className={classes.card}>
									<CardTranslation t={t} i18nKey='values.safety-first' />
								</Card>
								<Card className={classes.card}>
									<CardTranslation t={t} i18nKey='values.intersectional' />
								</Card>
								<Card className={classes.card}>
									<CardTranslation t={t} i18nKey='values.innovative' />
								</Card>
								<Card className={classes.card}>
									<CardTranslation t={t} i18nKey='values.free' />
								</Card>
							</Group>
						</Stack>
					</Grid>
				</Container>
			</CallOut>
			<CallOut backgroundColor={theme.other.colors.tertiary.lightBlue}>
				<Container>
					<Grid>
						<Grid.Col xs={12} sm={12} md={10} lg={8} xl={6} p={0}>
							<Stack spacing={40} align='center'>
								<Trans
									i18nKey='call-out.hear-from-users'
									t={t}
									ns='landingPage'
									components={{
										Title1: (
											<Title order={1} align='center'>
												.
											</Title>
										),
									}}
								/>
								<Carousel
									withControls={false}
									withIndicators
									getEmblaApi={setEmbla}
									plugins={[autoplay.current]}
									onMouseEnter={autoplay.current.stop}
									onMouseLeave={autoplay.current.reset}
									classNames={carouselStyles}
								>
									{!reviews ? (
										<Carousel.Slide>
											<Card h='100%' className={classes.reviewCard}>
												<UserReview reviewText='' reviewDate={new Date()} verifiedUser forceLoading />
											</Card>
										</Carousel.Slide>
									) : (
										reviews.map(({ user, reviewText, verifiedUser, createdAt, id }) => {
											if (!reviewText) {
												return null
											}
											const props = {
												user,
												reviewText,
												verifiedUser,
												reviewDate: createdAt,
											}
											return (
												<Carousel.Slide key={id}>
													<Card h='100%' className={classes.reviewCard}>
														<UserReview {...props} />
													</Card>
												</Carousel.Slide>
											)
										})
									)}
								</Carousel>
							</Stack>
						</Grid.Col>
					</Grid>
				</Container>
			</CallOut>
			<AccountVerifyModal />
			<ResetPasswordModal />
			<AntiHatePopup autoLaunch={!launchAHpopup} />
		</>
	)
}
Home.omitGrid = true

export const getStaticProps: GetStaticProps = async ({ locale }) => {
	const ssg = await trpcServerClient({ session: null })

	const [i18n] = await Promise.allSettled([
		getServerSideTranslations(locale, ['common', 'landingPage', 'attribute']),
		ssg.review.getFeatured.prefetch(3),
	])

	return {
		props: {
			trpcState: ssg.dehydrate(),
			...(i18n.status === 'fulfilled' ? i18n.value : {}),
		},
		revalidate: 60 * 60 * 24, // 24 hours
	}
}

export default Home
