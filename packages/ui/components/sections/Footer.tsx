import { Title, Grid, Text, Stack, Group, createStyles, rem } from '@mantine/core'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'

import InReach from '~ui/assets/inreach.svg'
import Vercel from '~ui/assets/vercel.svg'
import { Link } from '~ui/components/core/Link'
import { SocialLink } from '~ui/components/core/SocialLink'
import { BodyGrid } from '~ui/layouts'

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
		[theme.fn.smallerThan('sm')]: {
			display: 'none',
		},
	},
	iconGroup: {
		maxWidth: rem(176),
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
			<Grid.Col xs={12} sm={6} pl={0}>
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
							{t('inreach-tagline')}
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
			<Grid.Col xs={6} sm={3}>
				<Stack justify='space-between' style={{ height: '100%' }} align='start' spacing='xl'>
					<Text fw={600}>{t('Support')}</Text>
					{support}
				</Stack>
			</Grid.Col>
			<Grid.Col xs={6} sm={3} pr={0}>
				<Stack spacing='xl'>
					<Text fw={600}>{t('Connect')}</Text>
					{connect}
					<Group noWrap className={classes.iconGroup}>
						<SocialLink icon='facebook' href='#' title='Facebook' />
						<SocialLink icon='twitter' href='#' title='Twitter' />
						<SocialLink icon='linkedin' href='#' title='LinkedIn' />
						<SocialLink icon='instagram' href='#' title='Instagram' />
					</Group>
					<Group noWrap className={classes.iconGroup} pb='24px'>
						<SocialLink icon='youtube' href='#' title='Youtube' />
						<SocialLink icon='tiktok' href='#' title='TikTok' />
						<SocialLink icon='github' href='#' title='GitHub' />
						<SocialLink icon='mail' href='#' title={t('Mail')} />
					</Group>
				</Stack>
			</Grid.Col>
		</BodyGrid>
	)
}
