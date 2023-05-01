import { Carousel, useAnimationOffsetEffect, type Embla } from '@mantine/carousel'
import {
	createStyles,
	useMantineTheme,
	Title,
	Text,
	Card,
	Stack,
	Container,
	Grid,
	rem,
	Group,
} from '@mantine/core'
import Autoplay from 'embla-carousel-autoplay'
import { type GetServerSidePropsContext } from 'next'
import Head from 'next/head'
import { useTranslation, Trans, TFunction } from 'next-i18next'
import { useRef, useState } from 'react'
import { trpcServerClient } from '@weareinreach/api/trpc'
import { getServerSession } from '@weareinreach/auth'
import { Link, UserReview } from '@weareinreach/ui/components/core'
import { Hero, CallOut } from '@weareinreach/ui/components/sections'
import { useCustomVariant } from '@weareinreach/ui/hooks'
import { AccountVerifyModal, ResetPasswordModal } from '@weareinreach/ui/modals'
import { PrivacyStatementModal } from '@weareinreach/ui/modals/PrivacyStatement'

import { api } from '~app/utils/api'
import { getServerSideTranslations } from '~app/utils/i18n'

import { NextPageWithoutGrid } from './_app'

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
		[theme.fn.largerThan('md')]: {
			maxWidth: '45%',
		},
	},
	cardGroup: {},
}))

const useCarouselStyles = createStyles((theme) => ({
	indicators: {
		bottom: rem(-40),
		gap: rem(16),
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
					<Link href='https://inreach.kindful.com/?utm_source=inreach-app' {...linkProps}>
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

const featuredReviews = [
	'orev_01GVDN0TH9Y5YG0GPBYZPJX5MF',
	'orev_01GVDN0TGTQCA9AVSD3VXWCMXW',
	'orev_01GVDN0TGV60SY6F6XJJVC9HDN',
]

const Home: NextPageWithoutGrid = () => {
	const { t } = useTranslation('landingPage')
	const theme = useMantineTheme()
	const { classes, cx } = useStyles()
	const { classes: carouselStyles } = useCarouselStyles()
	const { data: reviews } = api.review.getByIds.useQuery(featuredReviews)
	const [embla, setEmbla] = useState<Embla | null>(null)
	const autoplay = useRef(Autoplay({ delay: 5000 }))
	useAnimationOffsetEffect(embla, 5000)
	return (
		<>
			<Head>
				<title>{t('inreach', { ns: 'common' })}</title>
			</Head>
			<Container mt={-40}>
				<Hero />
			</Container>
			<CallOut backgroundColor={theme.other.colors.tertiary.darkBlue}>
				<Container>
					<Grid>
						<Grid.Col sm={8}>
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
						<Grid.Col sm={8}>
							<Stack spacing={40} align='center'>
								<Trans
									i18nKey='call-out.hear-from-users'
									t={t}
									ns='landingPage'
									components={{ Title1: <Title order={1}>.</Title> }}
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
											<Card h='100%'>
												<UserReview reviewText='' reviewDate={new Date()} verifiedUser forceLoading />
											</Card>
										</Carousel.Slide>
									) : (
										reviews.map(({ user, reviewText, verifiedUser, createdAt, id }) => {
											if (!reviewText) return null
											const props = {
												user,
												reviewText,
												reviewDate: createdAt,
												verifiedUser,
											}
											return (
												<Carousel.Slide key={id}>
													<Card h='100%'>
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
		</>
	)
}

export const getServerSideProps = async ({ locale, req, res }: GetServerSidePropsContext) => {
	const ssg = await trpcServerClient()
	const session = await getServerSession({ req, res })
	await ssg.review.getByIds.prefetch(featuredReviews)

	return {
		props: {
			session,
			trpcState: ssg.dehydrate(),
			...(await getServerSideTranslations(locale, ['common', 'landingPage'])),
		},
	}
}
Home.omitGrid = true
export default Home
