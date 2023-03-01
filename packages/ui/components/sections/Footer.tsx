import { Title, Grid, Text, Stack, Group, createStyles } from '@mantine/core'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'

import InReach from '~ui/assets/inreach.svg'
import Vercel from '~ui/assets/vercel.svg'
import { Link } from '~ui/components/core/Link'
import { SocialMediaIconButton } from '~ui/components/core/SocialMediaIconButton'
import { BodyGrid } from '~ui/layouts'

const useStyles = createStyles((theme) => ({
	link: {
		color: `${theme.other.colors.secondary.black} !important`,
	},
	copyrightText: {
		...theme.other.utilityFonts.utility4,
		color: theme.other.colors.secondary.darkGray,
	},
	footerContent: {
		marginTop: '40px',
		marginBottom: '40px',
		[theme.fn.smallerThan('sm')]: {
			marginTop: 0,
			marginBottom: 0,
		},
	},
	footerStack: {
		[theme.fn.smallerThan('sm')]: {
			textAlign: 'center',
			justifyContent: 'center',
			alignItems: 'center',
		},
	},
	background: {
		backgroundColor: theme.other.colors.tertiary.footer,
	},
	iconGroup: {
		maxWidth: '176px',
	},
}))

const supportLinks = [
	['footer-suggest-org', '#'],
	['footer-share-feedback', '#'],
	['footer-vetting-process', '#'],
	['footer-privacy-statement', '#'],
	['footer-anti-hate', '#'],
	['footer-digital-accessibility', '#'],
	['footer-disclaimer":', '#'],
]

const connectLinks = [
	['inreach-org', '#'],
	['download-app', '#'],
	['footer-subscribe-newsletter', '#'],
]

export const Footer = () => {
	const { t } = useTranslation()
	const { classes, cx } = useStyles()

	const makeLinks = (links: string[][]) =>
		links.map(([text, href]) => (
			<Text key={text} component={Link} href={`/${href}`} fw={500} className={classes.link}>
				{t(text as string)}
			</Text>
		))

	const support = makeLinks(supportLinks)

	const connect = makeLinks(connectLinks)

	return (
		<BodyGrid className={classes.background}>
			<Grid.Col xs={12} sm={6} className={classes.footerContent} order={3} orderXs={0}>
				<Stack justify='space-between' style={{ height: '100%' }} className={classes.footerStack}>
					<Stack align='start' spacing={40} className={classes.footerStack}>
						<Image src={InReach} alt={t('inreach-logo')} width={100} height={37.53} />
						<Title order={2} fw={500}>
							{t('inreach-tagline')}
						</Title>
						<a href='https://vercel.com/?utm_source=in-reach&utm_campaign=oss'>
							<Image src={Vercel} alt={t('powered-by-vercel')} width={240} height={48} />
						</a>
					</Stack>
					<Text className={classes.copyrightText}>
						{t('inreach-copyright', { year: new Date().getFullYear() })}
					</Text>
				</Stack>
			</Grid.Col>
			<Grid.Col xs={6} sm={3} className={classes.footerContent}>
				<Stack
					justify='space-between'
					style={{ height: '100%' }}
					align='start'
					spacing='xl'
					className={classes.footerStack}
				>
					<Text fw={600}>{t('Support')}</Text>
					{support}
				</Stack>
			</Grid.Col>
			<Grid.Col xs={6} sm={3} className={classes.footerContent}>
				<Stack spacing='xl' className={classes.footerStack}>
					<Text fw={600}>{t('Connect')}</Text>
					{connect}
					<Group noWrap className={classes.iconGroup}>
						<SocialMediaIconButton icon='facebook' href='#' title='Facebook' />
						<SocialMediaIconButton icon='twitter' href='#' title='Twitter' />
						<SocialMediaIconButton icon='linkedin' href='#' title='LinkedIn' />
						<SocialMediaIconButton icon='instagram' href='#' title='Instagram' />
					</Group>
					<Group noWrap className={classes.iconGroup} pb='24px'>
						<SocialMediaIconButton icon='youtube' href='#' title='Youtube' />
						<SocialMediaIconButton icon='tiktok' href='#' title='TikTok' />
						<SocialMediaIconButton icon='github' href='#' title='GitHub' />
						<SocialMediaIconButton icon='mail' href='#' title={t('Mail')} />
					</Group>
				</Stack>
			</Grid.Col>
		</BodyGrid>
	)
}
