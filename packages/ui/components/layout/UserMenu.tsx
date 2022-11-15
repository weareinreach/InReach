import userIcon from '@iconify/icons-fa6-solid/user'
import { Icon } from '@iconify/react'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'

import Image from 'next/image'

import { useState } from 'react'

import { Avatar, Button, Group, Menu, Skeleton, Text, UnstyledButton, createStyles } from '@mantine/core'

const useStyles = createStyles((theme) => ({
	menu: {
		width: '15rem',
		// display: 'inline',
		alignItems: 'center',
	},
	loadingItems: {
		display: 'inline-block',
	},
	userIcon: {
		color: theme.colors.inReachGreen[5],
	},
}))

export const UserMenu = () => {
	const { t } = useTranslation('common')
	const { data: session, status } = useSession()
	const [_userMenuOpen, setUserMenuOpen] = useState(false)
	const { classes } = useStyles()

	if (status === 'loading' && !session) {
		return (
			<Group className={classes.menu}>
				<Skeleton height={50} circle className={classes.loadingItems} />
				<Skeleton height={8} radius='xl' className={classes.loadingItems} w='10rem' h='1rem' />
			</Group>
		)
	}

	if (session?.user && status === 'authenticated') {
		return (
			<Menu
				width={260}
				position='bottom-end'
				transition='scale-y'
				onClose={() => setUserMenuOpen(false)}
				onOpen={() => setUserMenuOpen(true)}
			>
				<Menu.Target>
					<UnstyledButton className={classes.menu}>
						<Group>
							<Avatar h={55} w={55} radius='xl'>
								{session.user.image ? (
									<Image
										src={session.user.image}
										height={55}
										width={55}
										alt={session.user.name || t('user-avatar')}
									/>
								) : (
									<Icon icon={userIcon} height={55} width={55} className={classes.userIcon} />
								)}
							</Avatar>
							<Text weight={500} size='sm' sx={{ lineHeight: 1 }} mr={3}>
								{session.user.name}
							</Text>
						</Group>
					</UnstyledButton>
				</Menu.Target>
				<Menu.Dropdown>
					<Menu.Item>{t('saved-lists')}</Menu.Item>
					<Menu.Item>{t('your-comments')}</Menu.Item>
					<Menu.Label>{t('settings')}</Menu.Label>
					<Menu.Item>{t('edit-profile')}</Menu.Item>
					<Menu.Divider />
					<Menu.Item>{t('log-out')}</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		)
	}
	return (
		<Group className={classes.menu}>
			<Button>{t('sign-up')}</Button>
			<Button variant='outline'>{t('log-in')}</Button>
		</Group>
	)
}
