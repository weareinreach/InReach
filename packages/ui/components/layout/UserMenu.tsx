import { Icon } from '@iconify/react'
import {
	Avatar,
	Button,
	DefaultProps,
	Group,
	Menu,
	Selectors,
	Skeleton,
	Text,
	UnstyledButton,
	createStyles,
} from '@mantine/core'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'

// import { useState } from 'react'

const useStyles = createStyles((theme) => ({
	menu: {
		width: 250,
	},
	buttonGroup: {
		width: 500,
	},
	buttons: {
		[theme.fn.smallerThan('md')]: {
			width: 200,
			margin: '0 auto',
		},
		[theme.fn.smallerThan('sm')]: {
			width: 300,
		},
	},
	loadingItems: {
		display: 'inline-block',
	},
	avatar: {
		color: theme.colors.inReachPrimaryRegular[5],
		height: 55,
		width: 55,
		[theme.fn.smallerThan('md')]: {
			height: 40,
			width: 40,
		},
	},
	actionButton: {
		fontWeight: theme.other.fontWeight.bold,
	},
}))

export const UserMenu = ({ className, classNames, styles, unstyled }: UserMenuProps) => {
	const { t } = useTranslation('nav')
	const { data: session, status } = useSession()
	// const [_userMenuOpen, setUserMenuOpen] = useState(false)
	const { classes, cx } = useStyles(undefined, { name: 'UserMenu', classNames, styles, unstyled })

	if (status === 'loading' && !session) {
		return (
			<Group className={cx(classes.menu, className)} noWrap>
				<Skeleton height={55} circle className={classes.loadingItems} />
				<Skeleton height={8} radius='xl' className={classes.loadingItems} w={160} h={16} />
			</Group>
		)
	}

	if (session?.user && status === 'authenticated') {
		return (
			<Menu
				width={260}
				position='bottom-end'
				transition='scale-y'
				// onClose={() => setUserMenuOpen(false)}
				// onOpen={() => setUserMenuOpen(true)}
			>
				<Menu.Target>
					<UnstyledButton className={cx(classes.menu, classes.buttons, className)}>
						<Group noWrap className={classes.buttons}>
							<Avatar radius='xl' className={classes.avatar}>
								{session.user.image ? (
									<Image
										src={session.user.image}
										height={55}
										width={55}
										className={classes.avatar}
										alt={session.user.name || t('user-avatar')}
									/>
								) : (
									<Icon icon='fa6-solid:user' className={classes.avatar} />
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
		<Group className={cx(classes.buttonGroup, className)}>
			<Button className={classes.buttons}>{t('sign-up')}</Button>
			<Button variant='outline' className={classes.buttons}>
				{t('log-in')}
			</Button>
		</Group>
	)
}

type ComponentStyles = Selectors<typeof useStyles>
type UserMenuProps = DefaultProps<ComponentStyles>
