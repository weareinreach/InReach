import { useTranslation } from 'next-i18next'

import Image from 'next/image'
import Link from 'next/link'

import {
	Burger,
	Center,
	Container,
	Group,
	Header,
	Paper,
	Space,
	Transition,
	createStyles,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'

import { NavItem } from '../../layout'
import { SafetyExit, UserMenu } from './'
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
		paddingBottom: 25,
		[theme.fn.largerThan('sm')]: {
			maxWidth: '50%',
			minWidth: 250,
			left: 'inherit',
		},
		[theme.fn.largerThan('md')]: {
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
		[theme.fn.smallerThan('md')]: {
			display: 'none',
		},
		padding: '0px 10px',
	},

	burger: {
		[theme.fn.largerThan('md')]: {
			display: 'none',
		},
		margin: '0px 10px',
	},

	link: {
		display: 'block',
		lineHeight: 1,
		padding: '8px 12px',
		borderRadius: theme.radius.sm,
		textDecoration: 'none',
		color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
		fontSize: theme.fontSizes.sm,
		fontWeight: 800,
		textTransform: 'uppercase',

		'&:hover': {
			backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
		},

		[theme.fn.smallerThan('md')]: {
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
	navGroup: {
		padding: '0px 20px',
		[theme.fn.smallerThan('md')]: {
			justifyContent: 'end',
		},
	},
	userMenu: {
		[theme.fn.smallerThan('md')]: {
			display: 'none',
		},
	},
	burgerUser: {
		width: '80%',
	},
}))

// TODO: [IN-689] Fix layout issues ~1024px viewport width

export interface NavProps {
	navItems: NavItem[]
}

export const Nav = (props: NavProps) => {
	const { navItems } = props
	const { classes } = useStyles()
	const { t } = useTranslation('common')
	const [opened, { toggle, close }] = useDisclosure(false)

	const navLinks = navItems.map((item, idx) => (
		<Link key={idx} href={item.href} className={classes.link} onClick={close} legacyBehavior={false}>
			{t(item.key)}
		</Link>
	))
	return (
		<Header height={HEADER_HEIGHT} className={classes.root}>
			<Container className={classes.header} size='xl'>
				<Image src={Logo} alt='InReach' height={50} />

				{/** This section shows at `lg` and up */}
				<Group noWrap w='100%' position='apart' className={classes.navGroup}>
					<Group spacing={5} className={classes.links}>
						{navLinks}
					</Group>
					<SafetyExit />
					<UserMenu className={classes.userMenu} />
				</Group>

				{/** This section shows at `md` and down */}
				<Burger opened={opened} onClick={toggle} className={classes.burger} />
				<Transition transition='pop-top-right' duration={200} mounted={opened}>
					{(styles) => (
						<Paper className={classes.dropdown} withBorder style={styles}>
							{navLinks}
							<Space h='sm' />
							<Center>
								<UserMenu className={classes.burgerUser} />
							</Center>
						</Paper>
					)}
				</Transition>
			</Container>
		</Header>
	)
}
