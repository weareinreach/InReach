import { Flex, Group, createStyles, rem, Container } from '@mantine/core'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'

import InReachLogo from '~ui/assets/inreach.svg'
import { Button, MobileNav, UserMenu } from '~ui/components/core'

const useStyles = createStyles((theme) => ({
	desktopNav: {
		height: rem(64),
		boxShadow: theme.shadows.xs,
		[theme.fn.smallerThan('md')]: {
			display: 'none',
		},
	},
	mobileNav: {
		[theme.fn.largerThan('md')]: {
			display: 'none',
		},
	},
}))

export const Navbar = () => {
	const { t } = useTranslation('nav')
	const { classes } = useStyles()

	return (
		<div className={classes.desktopNav}>
			<Container>
				<Flex justify='space-between' align='center'>
					<Image src={InReachLogo} width={100} height={37.53} alt='InReach' style={{ margin: 0 }} />
					<Group spacing={40} noWrap align='center'>
						<UserMenu />
						{/* TODO: add link for safety exit */}
						<Button variant='accent'>{t('safety-exit')}</Button>
					</Group>
				</Flex>
				<div className={classes.mobileNav}>
					<MobileNav />
				</div>
			</Container>
		</div>
	)
}
