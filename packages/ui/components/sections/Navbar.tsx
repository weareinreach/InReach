import { Container, createStyles, Flex, Group, rem } from '@mantine/core'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'

import InReachLogo from '~ui/assets/inreach.svg'
import { Button } from '~ui/components/core/Button'
import { Link } from '~ui/components/core/Link'
import { MobileNav } from '~ui/components/core/MobileNav'
import { UserMenu } from '~ui/components/core/UserMenu'
import { useCustomVariant, useScreenSize } from '~ui/hooks'

const useStyles = createStyles((theme) => ({
	desktopNav: {
		height: rem(64),
		boxShadow: theme.shadows.xs,
		marginBottom: rem(40),
		[theme.fn.smallerThan('sm')]: {
			display: 'none',
		},
	},
	mobileNav: {
		[theme.fn.largerThan('sm')]: {
			display: 'none',
		},
	},
}))

export const Navbar = () => {
	const { t } = useTranslation()
	const { classes } = useStyles()
	const variants = useCustomVariant()
	const { isMobile, isTablet } = useScreenSize()

	return isMobile || isTablet ? (
		<MobileNav className={classes.mobileNav} />
	) : (
		<>
			<Container className={classes.desktopNav} fluid maw='100%'>
				<Flex justify='space-between' align='center' pt={5}>
					<Link href='/' target='_self' py={8}>
						<Image src={InReachLogo} width={100} height={38} alt={t('inreach-logo')} style={{ margin: 0 }} />
					</Link>
					<Group spacing={40} noWrap align='center'>
						<UserMenu />
						<Link href='https://www.google.com' target='_self' variant={variants.Link.inheritStyle}>
							<Button variant='accent'>{t('safety-exit')}</Button>
						</Link>
					</Group>
				</Flex>
			</Container>
		</>
	)
}
