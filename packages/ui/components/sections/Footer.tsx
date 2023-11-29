import { createStyles, Grid, Group, rem, Stack, Text, Title } from '@mantine/core'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { Trans, useTranslation } from 'next-i18next'
import { type MouseEventHandler } from 'react'

import InReach from '~ui/assets/inreach.svg'
import Vercel from '~ui/assets/vercel.svg'
import { type ExternalLink, type InternalLink, Link } from '~ui/components/core/Link'
import { SocialLink } from '~ui/components/core/SocialLink'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { BodyGridNoTopMargin } from '~ui/layouts'
// import { GenericContentModal, PrivacyStatementModal } from '~ui/modals'

// @ts-expect-error Next Dynamic doesn't like polymorphic components
const GenericContentModal = dynamic(() =>
	import('~ui/modals/GenericContent').then((mod) => mod.GenericContentModal)
)
// @ts-expect-error Next Dynamic doesn't like polymorphic components
const PrivacyStatementModal = dynamic(() =>
	import('~ui/modals/PrivacyStatement').then((mod) => mod.PrivacyStatementModal)
)

const useStyles = createStyles((theme) => ({
	link: {
		color: `${theme.other.colors.secondary.black} !important`,
	},
	copyrightText: {
		...theme.other.utilityFonts.utility4,
		color: theme.other.colors.secondary.darkGray,
	},
	background: {
		backgroundColor: theme.other.colors.tertiary.footer,
		padding: `${rem(40)} ${rem(0)}`,
		[theme.fn.smallerThan('sm')]: {
			display: 'none',
		},
	},
	iconGroup: {
		maxWidth: rem(176),
	},
}))

type FooterLinkInt = {
	key: string
	href: InternalLink
	onClick?: never
	external: false
}
type FooterLinkExt = {
	key: string
	href?: ExternalLink
	onClick?: MouseEventHandler<HTMLAnchorElement>
	external: true
}
type LinkArr = (FooterLinkInt | FooterLinkExt)[]

const connectLinks: LinkArr = [
	{ key: 'inreach-org', href: 'https://www.inreach.org', external: true },
	{ key: 'download-app', href: 'https://inreach.org/mobile-app/', external: true },
	{ key: 'footer.subscribe-newsletter', href: 'https://inreach.org/newsletter/', external: true },
]

export const Footer = () => {
	const { t } = useTranslation('common')
	const { classes } = useStyles()
	const variants = useCustomVariant()
	const linkVar = { variant: variants.Link.inlineInvertedUtil1 }
	const support = [
		<Link key={0} href='/suggest' target='_self' {...linkVar}>
			{t('footer.suggest-org')}
		</Link>,
		<Link key={1} href='https://www.surveymonkey.com/r/96QD8ZQ' external {...linkVar}>
			{t('footer.share-feedback')}
		</Link>,
		<Link key={2} href='https://inreach.org/vetting-process/' external {...linkVar}>
			{t('footer.vetting-process')}
		</Link>,
		<PrivacyStatementModal key={3} component={Link} {...linkVar}>
			{t('footer.privacy-statement')}
		</PrivacyStatementModal>,
		<GenericContentModal key={4} content='antiHate' component={Link} {...linkVar}>
			{t('footer.anti-hate')}
		</GenericContentModal>,
		<GenericContentModal key={5} content='accessibilityStatement' component={Link} {...linkVar}>
			{t('footer.digital-accessibility')}
		</GenericContentModal>,
		<GenericContentModal key={6} content='disclaimer' component={Link} {...linkVar}>
			{t('footer.disclaimer')}
		</GenericContentModal>,
	]

	const connect = connectLinks.map(({ key, ...props }, idx) => (
		<Link key={idx} variant={variants.Link.inlineInvertedUtil1} {...props}>
			{t(key)}
		</Link>
	))

	return (
		<div className={classes.background}>
			<BodyGridNoTopMargin>
				<Grid.Col xs={12} sm={6} pl={0} pt={0} pb={0}>
					<Stack justify='space-between' style={{ height: '100%' }}>
						<Stack align='start' spacing={24}>
							<Image
								src={InReach}
								alt={t('inreach-logo')}
								width={100}
								height={37.53}
								style={{ marginBottom: 0 }}
							/>
							<Title order={2} fw={500}>
								<Trans i18nKey='footer.tagline' />
							</Title>
							<a href='https://vercel.com/?utm_source=in-reach&utm_campaign=oss' style={{ margin: 0 }}>
								<Image
									src={Vercel}
									alt={t('powered-by-vercel')}
									width={240}
									height={48}
									style={{ marginBottom: 0, marginLeft: -2, marginTop: 8 }}
								/>
							</a>
						</Stack>
						<Text className={classes.copyrightText}>
							{t('inreach-copyright', { year: new Date().getFullYear() })}
						</Text>
					</Stack>
				</Grid.Col>
				<Grid.Col xs={6} sm={3} pt={0} pb={0}>
					<Stack justify='space-between' style={{ height: '100%' }} align='start' spacing='xl'>
						<Text fw={600}>{t('support')}</Text>
						{support}
					</Stack>
				</Grid.Col>
				<Grid.Col xs={6} sm={3} pr={0} pt={0} pb={0}>
					<Stack spacing='xl'>
						<Text fw={600}>{t('connect')}</Text>
						{connect}
						<Group noWrap className={classes.iconGroup}>
							<SocialLink icon='facebook' href='https://www.facebook.com/weareinreach' />
							<SocialLink icon='twitter' href='https://twitter.com/weareinreach' />
							<SocialLink icon='linkedin' href='https://www.linkedin.com/company/weareinreach' />
							<SocialLink icon='instagram' href='https://www.instagram.com/weareinreach' />
						</Group>
						<Group noWrap className={classes.iconGroup} pb='24px'>
							<SocialLink icon='youtube' href='https://www.youtube.com/channel/UCJsVS5-0ymo40mRjCe4BIHA' />
							<SocialLink icon='tiktok' href='https://www.tiktok.com/@weareinreach' />
							<SocialLink icon='github' href='https://github.com/weareinreach' />
							<SocialLink icon='email' href='https://inreach.org/contact/' />
						</Group>
					</Stack>
				</Grid.Col>
			</BodyGridNoTopMargin>
		</div>
	)
}
