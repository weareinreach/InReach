import { Flex, Group, createStyles } from '@mantine/core'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'

import { Button, MobileNav } from '../core'
import { UserMenu } from '../layout'

const useStyles = createStyles((theme) => ({
	desktopNav: {
		height: 64,
		padding: '0px 64px',
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
		<>
			<Flex justify='space-between' align='center' className={classes.desktopNav}>
				<Image src='public/img/inreach.svg' width={100} height={37.53} alt='InReach' style={{ margin: 0 }} />
				<Group spacing={40} noWrap>
					<UserMenu />
					<Button variant='accent'>{t('safety-exit')}</Button>
				</Group>
			</Flex>
			<div className={classes.mobileNav}>
				<MobileNav />
			</div>
		</>
	)
}
