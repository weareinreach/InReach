import { Title, Grid, Text, Stack, Group, createStyles } from '@mantine/core'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'

import { Link } from './Link'
import { SocialMediaIconButton } from './SocialMediaIconButton'

const useStyles = createStyles((theme) => ({
	link: {
		color: `${theme.other.colors.secondary.black} !important`,
	},
	copyrightText: {
		...theme.other.utilityFonts.utility4,
		color: theme.other.colors.secondary.darkGray,
	},
	footerContent: {
		backgroundColor: theme.other.colors.primary.footer,
		padding: 0,
	},
}))

const supportLinks = [
	['Suggest an organization', '#'],
	['Share feedback', '#'],
	['Vetting process', '#'],
	['Privacy statement', '#'],
	['Anti-hate commitment', '#'],
	['Digital accessibility', '#'],
	['Disclaimer', '#'],
]

const connectLinks = [
	['Inreach.org', '#'],
	['Download the app', '#'],
	['Subscribe to our newsletter', '#'],
]

export const Footer = () => {
	const { classes } = useStyles()
	const { t } = useTranslation()

	const makeLinks = (links: string[][]) =>
		links.map(([text, href]) => (
			<Text key={text} component={Link} href={`/${href}`} fw={500} className={classes.link}>
				{t(text as string)}
			</Text>
		))

	const support = makeLinks(supportLinks)

	const connect = makeLinks(connectLinks)

	return (
		<>
			<Grid.Col md={5} sm={12} className={classes.footerContent}>
				<Stack justify='space-between' style={{ height: '100%' }}>
					<Stack align='start' spacing={40}>
						<Text>Inreach</Text>
						<Title order={2} fw={500}>
							{t('Seek LGBTQ+ resources. Reach safety. Find belonging.')}
						</Title>
						<Image src='layout/img/vercel.svg' alt='vercel' width={240} height={48} />
					</Stack>
					<Text className={classes.copyrightText}>
						{' '}
						{t('InReach, Inc. 2023 • All rights reserved • InReach ❤️ Open Source')}
					</Text>
				</Stack>
			</Grid.Col>
			<Grid.Col md={3} sm={6} className={classes.footerContent}>
				<Stack justify='space-between' style={{ height: '100%' }} align='start' spacing='xl'>
					<Text fw={600}>{t('Support')}</Text>
					{support}
				</Stack>
			</Grid.Col>
			<Grid.Col md={3} sm={6} className={classes.footerContent}>
				<Stack spacing='xl'>
					<Text fw={600}>{t('Connect')}</Text>
					{connect}
					<Group>
						<SocialMediaIconButton icon='facebook' href='#' title='Facebook' />
						<SocialMediaIconButton icon='twitter' href='#' title='Twitter' />
						<SocialMediaIconButton icon='linkedin' href='#' title='LinkedIn' />
						<SocialMediaIconButton icon='instagram' href='#' title='Instagram' />
					</Group>
					<Group>
						<SocialMediaIconButton icon='youtube' href='#' title='Youtube' />
						<SocialMediaIconButton icon='tiktok' href='#' title='TikTok' />
						<SocialMediaIconButton icon='github' href='#' title='GitHub' />
						<SocialMediaIconButton icon='mail' href='#' title={t('Mail')} />
					</Group>
				</Stack>
			</Grid.Col>
		</>
	)
}
