import {
	createStyles,
	type DefaultProps,
	Group,
	Menu,
	rem,
	type Selectors,
	UnstyledButton,
} from '@mantine/core'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { signOut, useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { type MouseEventHandler, useCallback, useMemo } from 'react'

import { checkPermissions } from '@weareinreach/auth'
import { Button } from '~ui/components/core/Button'
import { LangPicker } from '~ui/components/core/LangPicker'
import { Link } from '~ui/components/core/Link'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'

// @ts-expect-error Next Dynamic doesn't like polymorphic components
const LoginModalLauncher = dynamic(() =>
	import('~ui/modals/LoginSignUp').then((mod) => mod.LoginModalLauncher)
)
// @ts-expect-error Next Dynamic doesn't like polymorphic components
const SignupModalLauncher = dynamic(() =>
	import('~ui/modals/LoginSignUp').then((mod) => mod.SignupModalLauncher)
)

const UserAvatar = dynamic(() => import('./UserAvatar').then((mod) => mod.UserAvatar))

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
		'&[data-expanded]': {
			backgroundColor: theme.other.colors.primary.lightGray,
		},
	},
	logoutButton: {
		padding: `${rem(14)} ${rem(12)}`,
	},
}))

export const UserMenu = ({ className, classNames, styles, unstyled }: UserMenuProps) => {
	const { t } = useTranslation('common')
	const { data: session, status } = useSession()
	const router = useRouter()
	const { classes, cx } = useStyles(undefined, { name: 'UserMenu', classNames, styles, unstyled })
	const variant = useCustomVariant()

	const isLoading = status === 'loading' || router.isFallback
	const canAccessDataPortal = checkPermissions({
		session,
		permissions: ['dataPortalBasic', 'dataPortalAdmin', 'dataPortalManager'],
		has: 'some',
	})
	const canAccessUserManagement =
		checkPermissions({ session, permissions: ['root'], has: 'all' }) &&
		session?.user.email.endsWith('@inreach.org')
	const editablePaths: (typeof router.pathname)[] = ['/org/[slug]', '/org/[slug]/[orgLocationId]']
	const isEditablePage = editablePaths.includes(router.pathname)
	const getEditPathname = useCallback((): typeof router.pathname => {
		switch (router.pathname) {
			case '/org/[slug]': {
				return '/org/[slug]/edit'
			}
			case '/org/[slug]/[orgLocationId]': {
				return '/org/[slug]/[orgLocationId]/edit'
			}
			default: {
				return router.pathname
			}
		}
	}, [router])
	const handleEditModeEntry = useCallback(() => {
		router.replace({ pathname: getEditPathname(), query: router.query })
	}, [getEditPathname, router])

	const handleSignout: MouseEventHandler<HTMLAnchorElement> = useCallback((e) => {
		e?.preventDefault?.()
		signOut()
	}, [])
	const shouldShowMenu = useMemo(
		() => (session?.user && status === 'authenticated') || isLoading,
		[isLoading, session?.user, status]
	)

	const menuOrLoginButtons = useMemo(() => {
		if (shouldShowMenu) {
			return (
				<>
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
								disabled={isLoading ? true : undefined}
							>
								<UserAvatar useLoggedIn />
							</UnstyledButton>
						</Menu.Target>
						<Menu.Dropdown>
							{canAccessDataPortal && (
								<>
									<Menu.Label>{t('user-menu.admin-options')}</Menu.Label>
									{canAccessUserManagement && (
										<Menu.Item component={Link} href='/admin/management' target='_self'>
											{t('user-menu.user-management')}
										</Menu.Item>
									)}
									<Menu.Item component={Link} href='/admin' target='_self'>
										{t('user-menu.data-portal')}
									</Menu.Item>
									{isEditablePage && (
										<Menu.Item component={Link} onClick={handleEditModeEntry} target='_self'>
											{t('user-menu.edit-page')}
										</Menu.Item>
									)}
									<Menu.Divider />
									<Menu.Label>{t('user-menu.user-options')}</Menu.Label>
								</>
							)}
							<Menu.Item component={Link} href='/account/saved' target='_self'>
								{t('words.saved')}
							</Menu.Item>
							<Menu.Item component={Link} href='/account/reviews' target='_self'>
								{t('words.reviews')}
							</Menu.Item>
							<Menu.Item component={Link} href='/account' target='_self'>
								{t('words.settings')}
							</Menu.Item>
							<Menu.Item component={Link} external onClick={handleSignout}>
								{t('log-out')}
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
					<UnstyledButton
						className={cx(classes.logoutButton)}
						variant={variant.Link.inlineInvertedUtil1}
						component={Link}
						style={{ visibility: isLoading ? 'hidden' : undefined }}
						onClick={handleSignout}
					>
						{!router.isFallback && t('log-out')}
					</UnstyledButton>
				</>
			)
		}
		return (
			<>
				<LoginModalLauncher component={UnstyledButton} className={classes.navText}>
					{t('log-in')}
				</LoginModalLauncher>
				<SignupModalLauncher component={Button}>{t('sign-up-free')}</SignupModalLauncher>
			</>
		)
	}, [
		canAccessDataPortal,
		classes,
		cx,
		handleEditModeEntry,
		handleSignout,
		isEditablePage,
		isLoading,
		router.isFallback,
		shouldShowMenu,
		t,
		variant,
	])

	return (
		<Group className={cx(className)} noWrap spacing={shouldShowMenu ? 28 : 40}>
			<LangPicker />
			{menuOrLoginButtons}
		</Group>
	)
}

type ComponentStyles = Selectors<typeof useStyles>
type UserMenuProps = DefaultProps<ComponentStyles>
