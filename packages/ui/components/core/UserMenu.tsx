import {
	createStyles,
	type DefaultProps,
	Group,
	Menu,
	rem,
	type Selectors,
	UnstyledButton,
} from '@mantine/core'
import { signOut, useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'

import { Button } from '~ui/components/core/Button'
import { LangPicker } from '~ui/components/core/LangPicker'
import { Link } from '~ui/components/core/Link'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { LoginModalLauncher } from '~ui/modals/Login'
import { SignupModalLauncher } from '~ui/modals/SignUp'

import { UserAvatar } from './UserAvatar'

const useStyles = createStyles((theme) => ({
	buttons: {
		padding: `${rem(4)} ${rem(12)}`,
		borderRadius: rem(8),
	},
	loadingItems: {
		display: 'inline-block',
	},
	avatarPlaceholder: {
		color: theme.other.colors.secondary.darkGray,
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
		padding: rem(16),
	},
	menuTarget: {
		'&:not(:disabled)': theme.fn.hover({
			backgroundColor: theme.other.colors.primary.lightGray,
		}),
		'&:disabled': theme.fn.hover({ cursor: 'auto' }),
	},
	logoutButton: {
		padding: `${rem(14)} ${rem(12)}`,
	},
}))

export const UserMenu = ({ className, classNames, styles, unstyled }: UserMenuProps) => {
	const { t } = useTranslation('common')
	const { data: session, status } = useSession()
	const { classes, cx } = useStyles(undefined, { name: 'UserMenu', classNames, styles, unstyled })
	const variant = useCustomVariant()

	const isLoading = status === 'loading'

	if ((session?.user && status === 'authenticated') || isLoading) {
		return (
			<Group noWrap spacing={28}>
				<LangPicker />
				<Menu
					width={260}
					position='bottom-start'
					transitionProps={{
						transition: 'scale-y',
					}}
					classNames={{ item: classes.menuItem }}
					radius='sm'
					shadow='xs'
					disabled={isLoading ? true : undefined}
				>
					<Menu.Target>
						<UnstyledButton
							className={cx(classes.buttons, classes.menuTarget)}
							sx={(theme) => ({
								'&[data-expanded]': {
									backgroundColor: theme.other.colors.primary.lightGray,
								},
							})}
							disabled={isLoading ? true : undefined}
						>
							<UserAvatar useLoggedIn />
						</UnstyledButton>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Item component={Link} href='/account/saved' target='_self'>
							{t('words.saved')}
						</Menu.Item>
						<Menu.Item component={Link} href='/account/reviews' target='_self'>
							{t('words.reviews')}
						</Menu.Item>
						<Menu.Item component={Link} href='/account' target='_self'>
							{t('words.settings')}
						</Menu.Item>
						<Menu.Item
							component={Link}
							external
							onClick={(e) => {
								e.preventDefault()
								signOut({ callbackUrl: '/' })
							}}
						>
							{t('log-out')}
						</Menu.Item>
					</Menu.Dropdown>
				</Menu>
				<UnstyledButton
					className={cx(classes.logoutButton)}
					variant={variant.Link.inlineInvertedUtil1}
					component={Link}
					style={{ visibility: isLoading ? 'hidden' : undefined }}
					onClick={(e) => {
						// e.preventDefault()
						signOut({ callbackUrl: '/' })
					}}
				>
					{t('log-out')}
				</UnstyledButton>
			</Group>
		)
	}
	return (
		<Group className={cx(className)} noWrap spacing={40}>
			<LangPicker />

			<LoginModalLauncher component={UnstyledButton} className={classes.navText}>
				{t('log-in')}
			</LoginModalLauncher>
			<SignupModalLauncher component={Button}>{t('sign-up-free')}</SignupModalLauncher>
		</Group>
	)
}

type ComponentStyles = Selectors<typeof useStyles>
type UserMenuProps = DefaultProps<ComponentStyles>
