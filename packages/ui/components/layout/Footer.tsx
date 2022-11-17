import { IconBrandInstagram, IconBrandTwitter, IconBrandYoutube } from '@tabler/icons'
import { useTranslation } from 'next-i18next'

import Image from 'next/image'
import Link from 'next/link'

import { ActionIcon, Group, createStyles } from '@mantine/core'

import Vercel from './img/vercel.svg'

const useStyles = createStyles((theme) => ({
	footer: {
		marginTop: 120,
		borderTop: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]}`,
	},

	inner: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: `${theme.spacing.md}px ${theme.spacing.md}px`,

		[theme.fn.smallerThan('sm')]: {
			flexDirection: 'column',
		},
	},

	links: {
		[theme.fn.smallerThan('sm')]: {
			marginTop: theme.spacing.lg,
			marginBottom: theme.spacing.sm,
		},
	},
}))

export interface FooterSectionProps {
	links: { href: string; key: string }[]
}

export const FooterSection = ({ links }: FooterSectionProps) => {
	const { classes } = useStyles()
	const { t } = useTranslation('common')
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

	return (
		<div className={classes.footer}>
			<div className={classes.inner}>
				<Image src={Vercel} alt={t('powered-by-vercel')} />

				<Group className={classes.links}>{items}</Group>

				<Group spacing='xs' position='right' noWrap>
					<ActionIcon size='lg' variant='default' radius='xl'>
						<IconBrandTwitter size={18} stroke={1.5} />
					</ActionIcon>
					<ActionIcon size='lg' variant='default' radius='xl'>
						<IconBrandYoutube size={18} stroke={1.5} />
					</ActionIcon>
					<ActionIcon size='lg' variant='default' radius='xl'>
						<IconBrandInstagram size={18} stroke={1.5} />
					</ActionIcon>
				</Group>
			</div>
		</div>
	)
}
