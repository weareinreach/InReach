import { Icon } from '@iconify/react'
import { useTranslation } from 'next-i18next'

import Image from 'next/image'
import Link from 'next/link'

import { ActionIcon, Center, Grid, Group, Space, Text, createStyles, useMantineTheme } from '@mantine/core'

import Vercel from './img/vercel.svg'

const useStyles = createStyles((theme) => ({
	footer: {
		marginTop: 120,
		borderTop: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]}`,
	},

	upper: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: `${theme.spacing.md}px ${theme.spacing.md}px`,
		backgroundColor: theme.colors.inReachSecondaryBackground[5],

		flexDirection: 'column',
	},
	lower: {
		padding: `${theme.spacing.md}px ${theme.spacing.md}px`,
		[theme.fn.smallerThan('md')]: { padding: `0 ${theme.spacing.sm}px` },
	},
	socialGroup: {
		marginTop: theme.spacing.md,
		marginBottom: theme.spacing.md,
		[theme.fn.smallerThan('md')]: {
			flexDirection: 'column',
			marginBottom: theme.spacing.sm,
		},
		[theme.fn.smallerThan('sm')]: {
			marginTop: theme.spacing.lg,
		},
	},
	linkGroup: {
		marginTop: theme.spacing.md,
		marginBottom: theme.spacing.md,
		[theme.fn.smallerThan('md')]: {
			marginTop: theme.spacing.sm,
			flexDirection: 'column',
		},
		[theme.fn.smallerThan('sm')]: {
			marginBottom: theme.spacing.sm,
		},
	},
	vercelBlock: {
		display: 'block',
		marginLeft: 'auto',
		[theme.fn.smallerThan('md')]: {
			marginRight: 'auto',
		},
	},
}))

export interface FooterSectionProps {
	links: { href: string; key: string }[]
	socialMedia: { iconCode: string; key: string; href: string }[]
}

export const FooterSection = ({ links, socialMedia }: FooterSectionProps) => {
	const { classes } = useStyles()
	const { t } = useTranslation('common')
	const { colors } = useMantineTheme()
	const items = links.map((link) => (
		<Link
			color='dimmed'
			key={link.key}
			href={link.href}
			style={{ lineHeight: 1 }}
			// onClick={(event) => event.preventDefault()}
		>
			{t(link.key)}
		</Link>
	))

	const socialLinks = socialMedia.map((service) => (
		<ActionIcon key={service.key} component={Link} href={service.href} title={t(service.key)}>
			<Icon
				icon={service.iconCode}
				height='1.5rem'
				color={colors.inReachSecondaryRegular[5]}
				style={{ lineHeight: '1rem' }}
			/>
		</ActionIcon>
	))

	return (
		<div className={classes.footer}>
			<div className={classes.upper}>
				<Group className={classes.socialGroup}>
					<Group>{socialLinks}</Group>
					<Link href='#download-app'>{t('download-app')}</Link>
				</Group>
				<Group className={classes.linkGroup}>{items}</Group>
			</div>
			<Grid className={classes.lower}>
				<Grid.Col md={4}></Grid.Col>
				<Grid.Col md={4}>
					<Center h='100%'>
						<Text align='center' span>
							{t('copyright', { year: new Date().getFullYear() })}
						</Text>
					</Center>
				</Grid.Col>
				<Grid.Col md={4}>
					<Link href='https://vercel.com/?utm_source=in-reach&utm_campaign=oss'>
						<Image src={Vercel} alt={t('powered-by-vercel')} className={classes.vercelBlock} />
					</Link>
				</Grid.Col>
			</Grid>
		</div>
	)
}
