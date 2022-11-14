import { Icon } from '@iconify/react'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'

import Image from 'next/image'
import Link from 'next/link'

import { useState } from 'react'

import {
	Avatar,
	Burger,
	Container,
	Group,
	Header,
	Menu,
	Paper,
	Skeleton,
	Text,
	Transition,
	UnstyledButton,
	createStyles,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'

import { NavItem } from '../../layout'
import Logo from './img/inreach.svg'

const HEADER_HEIGHT = 60

const useStyles = createStyles((theme) => ({
	root: {
		position: 'relative',
		zIndex: 1,
	},
	dropdown: {
		position: 'absolute',
		top: HEADER_HEIGHT,
		left: 0,
		right: 0,
		zIndex: 0,
		borderTopRightRadius: 0,
		borderTopLeftRadius: 0,
		borderTopWidth: 0,
		overflow: 'hidden',

		[theme.fn.largerThan('sm')]: {
			display: 'none',
		},
	},

	header: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		height: '100%',
	},

	links: {
		[theme.fn.smallerThan('sm')]: {
			display: 'none',
		},
	},

	burger: {
		[theme.fn.largerThan('sm')]: {
			display: 'none',
		},
	},

	link: {
		display: 'block',
		lineHeight: 1,
		padding: '8px 12px',
		borderRadius: theme.radius.sm,
		textDecoration: 'none',
		color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
		fontSize: theme.fontSizes.sm,
		fontWeight: 500,

		'&:hover': {
			backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
		},

		[theme.fn.smallerThan('sm')]: {
			borderRadius: 0,
			padding: theme.spacing.md,
		},
	},

	linkActive: {
		'&, &:hover': {
			backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).background,
			color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
		},
	},
}))

interface Props {
	navItems: NavItem[]
}
export const UserMenu = () => {
	const { t } = useTranslation('common')
	const { data: session, status } = useSession()
	const [userMenuOpen, setUserMenuOpen] = useState(false)

	if (status === 'loading' && !session) {
		return (
			<>
				<Skeleton height={50} circle />
				<Skeleton height={8} radius='xl' />
			</>
		)
	}

	if (session?.user) {
		return (
			<Menu
				width={260}
				position='bottom-end'
				transition='pop-top-right'
				onClose={() => setUserMenuOpen(false)}
				onOpen={() => setUserMenuOpen(true)}
			>
				<Menu.Target>
					<UnstyledButton>
						<Avatar>
							{session.user.image ? (
								<Image src={session.user.image} alt={session.user.name || t('user-avatar')} />
							) : (
								<Icon icon='fa6-solid:user' />
							)}
						</Avatar>
						<Text weight={500} size='sm' sx={{ lineHeight: 1 }} mr={3}>
							{session.user.name}
						</Text>
					</UnstyledButton>
				</Menu.Target>
			</Menu>
		)
	}
	return <>Login | Logout</>
}

export const Nav = (props: Props) => {
	const { navItems } = props
	const { classes } = useStyles()
	const { t } = useTranslation('common')
	const [opened, { toggle, close }] = useDisclosure(false)

	const navLinks = navItems.map((item, idx) => (
		<Link key={idx} href={item.href} className={classes.link} onClick={close}>
			{t(item.key)}
		</Link>
	))
	return (
		<Header height={HEADER_HEIGHT} className={classes.root}>
			<Container className={classes.header}>
				<Image src={Logo} alt='InReach' height={50} />
				<Group spacing={5} className={classes.links}>
					{navLinks}
				</Group>

				<Burger opened={opened} onClick={toggle} className={classes.burger} />
				<Transition transition='pop-top-right' duration={200} mounted={opened}>
					{(styles) => (
						<Paper className={classes.dropdown} withBorder style={styles}>
							{navLinks}
						</Paper>
					)}
				</Transition>
				<UserMenu />
			</Container>
		</Header>
	)
}
