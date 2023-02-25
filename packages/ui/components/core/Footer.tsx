import { Container, Title, Grid, Text, Stack, Group, createStyles } from '@mantine/core'

import { Button } from './Button'
import { SocialMediaIconButton } from './SocialMediaIconButton'
import { BodyGrid } from '../layout'

const useStyles = createStyles((theme) => ({
	footer: {
		backgroundColor: theme.other.colors.primary.footer,
		['& a']: {
			color: theme.colors.dark,
		},
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

const makeLinks = (links: string[][]) =>
	links.map(([text, href]) => (
		<Text key={text} component='a' href={href} fw={500}>
			{text}
		</Text>
	))

export const Footer = () => {
	const { classes } = useStyles()

	const support = makeLinks(supportLinks)

	const connect = makeLinks(connectLinks)

	return (
		<Container className={classes.footer} fluid>
			<BodyGrid style={{ padding: '40px' }} grow>
				<Grid.Col md={5} sm={12}>
					<Stack justify='space-between' style={{ height: '100%' }}>
						<Stack align='start' spacing='xl'>
							<Text>Inreach</Text>
							<Title order={2} fw={500}>
								{' '}
								Seek LGBTQ+ resources. Reach safety. Find belonging
							</Title>
							<Button variant='primary' style={{ padding: '6px 48px' }} {...{ radius: 'md' }}>
								Powered by Vercel
							</Button>
						</Stack>
						<Text fz='xs'>InReach, Inc. 2023 • All rights reserved • InReach ❤️ Open Source</Text>
					</Stack>
				</Grid.Col>
				<Grid.Col md={3} sm={6}>
					<Stack justify='space-between' style={{ height: '100%' }} align='start' spacing='xl'>
						<Text fw={600}>Support</Text>
						{support}
					</Stack>
				</Grid.Col>
				<Grid.Col md={3} sm={6}>
					<Stack spacing='xl'>
						<Text fw={600}>Connect</Text>
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
							<SocialMediaIconButton icon='mail' href='#' title='Mail' />
						</Group>
					</Stack>
				</Grid.Col>
			</BodyGrid>
		</Container>
	)
}
