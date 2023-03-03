import { Flex, Group, Grid, createStyles } from '@mantine/core'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'

import { Button, MobileNav, UserMenu } from '~ui/components/core'
import { BodyGrid } from '~ui/layouts'

const useStyles = createStyles((theme) => ({
	desktopNav: {
		height: 64,
		padding: '0px 40px !important',
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
			<BodyGrid
				className={classes.desktopNav}
				grow
				sx={{ margin: '0px !important', height: '100%' }}
				align='center'
			>
				<Grid.Col p='0px !important'>
					<Flex justify='space-between'>
						<Image
							src='public/img/inreach.svg'
							width={100}
							height={37.53}
							alt='InReach'
							style={{ margin: 0 }}
						/>
						<Group spacing={40} noWrap>
							<UserMenu />
							{/* TODO: add link for safety exit */}
							<Button variant='accent'>{t('safety-exit')}</Button>
						</Group>
					</Flex>
				</Grid.Col>
			</BodyGrid>
			<div className={classes.mobileNav}>
				<MobileNav />
			</div>
		</>
	)
}
