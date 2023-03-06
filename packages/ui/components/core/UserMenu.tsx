import {
	Avatar,
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
import { useSession, signOut } from 'next-auth/react'
import { useTranslation } from 'next-i18next'

import { Button } from '~ui/components/core/Button'
import { LangPicker } from '~ui/components/core/LangPicker'
import { Link } from '~ui/components/core/Link'
import { Icon } from '~ui/icon'
import { openLoginModal } from '~ui/modals/Login'
import { openSignUpModal } from '~ui/modals/SignUp'

const useStyles = createStyles((theme) => ({
	buttons: {
		padding: '4px 12px',
		borderRadius: 8,
		'&:hover': {
			backgroundColor: theme.other.colors.primary.lightGray,
		},
	},
	loadingItems: {
		display: 'inline-block',
	},
	avatar: {
		color: theme.colors.inReachPrimaryRegular[5],
		height: 40,
		width: 40,
	},
	actionButton: {
		fontWeight: theme.other.fontWeight.bold,
	},
	navText: {
		...theme.other.utilityFonts.utility1,
		color: `${theme.other.colors.secondary.black} !important`,
		'&:hover': {
			textDecoration: 'underline',
		},
	},
	menuItem: {
		...theme.other.utilityFonts.utility1,
		color: `${theme.other.colors.secondary.black} !important`,
		padding: 16,
	},
}))

export const UserMenu = ({ className, classNames, styles, unstyled }: UserMenuProps) => {
	const { t, i18n } = useTranslation()
	const { data: session, status } = useSession()
	const { classes, cx } = useStyles(undefined, { name: 'UserMenu', classNames, styles, unstyled })

	const currentLanguage = i18n.language

	if (status === 'loading' && !session) {
		return (
			<Group className={cx(className)} noWrap>
				<Skeleton height={40} circle className={classes.loadingItems} />
				<Skeleton height={8} radius='xl' className={classes.loadingItems} w={100} h={16} />
			</Group>
		)
	}

	if (session?.user && status === 'authenticated') {
		let displayName = 'User'
		if (typeof session.user.name === 'string') {
			const [name, lastName] = session.user.name.split(' ').slice(0, 2)
			displayName = `${name} ${typeof lastName === 'string' ? lastName.substr(0, 1).toUpperCase() : ''}.`
		}
		return (
			<Group noWrap spacing={36}>
				<Menu
					width={260}
					position='bottom-start'
					transition='scale-y'
					classNames={{ item: classes.menuItem }}
					radius='sm'
					shadow='xs'
				>
					<Menu.Target>
						<UnstyledButton
							className={cx(classes.buttons, className)}
							sx={(theme) => ({
								'&[data-expanded]': {
									backgroundColor: theme.other.colors.primary.lightGray,
								},
							})}
						>
							<Group noWrap spacing='sm'>
								<Avatar radius='xl' className={classes.avatar}>
									{session.user.image ? (
										<Image
											src={session.user.image}
											height={70}
											width={70}
											className={classes.avatar}
											alt={session.user.name || t('user-avatar')}
											style={{ margin: 0 }}
										/>
									) : (
										<Icon icon='carbon:user' className={classes.avatar} />
									)}
								</Avatar>
								<Text className={classes.navText}>{displayName}</Text>
							</Group>
						</UnstyledButton>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Item>{t('saved-lists')}</Menu.Item>
						<Menu.Item>{t('your-comments')}</Menu.Item>
						<Menu.Item>{t('settings')}</Menu.Item>
						<Menu.Item
							onClick={(e) => {
								e.preventDefault()
								signOut()
							}}
						>
							{t('log-out')}
						</Menu.Item>
					</Menu.Dropdown>
				</Menu>
				<Text
					component={Link}
					href='/'
					className={classes.navText}
					onClick={(e) => {
						e.preventDefault()
						signOut()
					}}
				>
					{t('log-out')}
				</Text>
			</Group>
		)
	}
	return (
		<Group className={cx(className)} noWrap spacing={40}>
			<LangPicker />
			<UnstyledButton onClick={() => openLoginModal()}>
				<Text className={classes.navText}>{t('log-in')}</Text>
			</UnstyledButton>
			<Button onClick={() => openSignUpModal()}>{t('sign-up')}</Button>
		</Group>
	)
}

type ComponentStyles = Selectors<typeof useStyles>
type UserMenuProps = DefaultProps<ComponentStyles>
