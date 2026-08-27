import { Group, Menu, UnstyledButton } from '@mantine/core'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { signOut, useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next/pages'
import { type MouseEventHandler, useCallback, useMemo } from 'react'

import { checkPermissions } from '@weareinreach/auth'
import { Button } from '~ui/components/core/Button'
import { LangPicker } from '~ui/components/core/LangPicker'
import { Link } from '~ui/components/core/Link'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { cx } from '~ui/lib/cx'

import classes from './UserMenu.module.css'

const LoginModalLauncher = dynamic(
	// @ts-expect-error Next Dynamic doesn't like polymorphic components
	() => import('~ui/modals/LoginSignUp').then((mod) => mod.LoginModalLauncher),
	{ ssr: false }
)
const SignupModalLauncher = dynamic(
	// @ts-expect-error Next Dynamic doesn't like polymorphic components
	() => import('~ui/modals/LoginSignUp').then((mod) => mod.SignupModalLauncher),
	{ ssr: false }
)

const UserAvatar = dynamic(() => import('./UserAvatar').then((mod) => mod.UserAvatar), { ssr: false })

export const UserMenu = ({ className }: UserMenuProps) => {
	const { t } = useTranslation('common')
	const { data: session, status } = useSession()
	const router = useRouter()
	const variant = useCustomVariant()

	const isLoading = status === 'loading' || router.isFallback
	const canAccessDataPortal = checkPermissions({
		session,
		permissions: ['dataPortalBasic', 'dataPortalAdmin', 'dataPortalManager'],
		has: 'some',
	})
	const editablePaths: (typeof router.pathname)[] = [
		'/org/[slug]',
		'/org/[slug]/[orgLocationId]',
		'/org/[slug]/remote',
	]
	const isEditablePage = editablePaths.includes(router.pathname)
	const getEditPathname = useCallback((): typeof router.pathname => {
		switch (router.pathname) {
			case '/org/[slug]': {
				return '/org/[slug]/edit'
			}
			case '/org/[slug]/[orgLocationId]': {
				return '/org/[slug]/[orgLocationId]/edit'
			}
			case '/org/[slug]/remote': {
				return '/org/[slug]/remote/edit'
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
						{/* Each item below pairs `variant={variant.Link.inheritStyle}` (font/color/line-height
						    from the surrounding Menu.Item) with an explicit `td='none'`: the variant's own
						    `text-decoration: inherit !important` is reliable for items with an `href`, but
						    the couple of items below with none (`onClick`-only, e.g. "Log out") go through
						    an extra polymorphic hop where the variant class has previously been observed not
						    to attach (see the class-vs-attribute-selector note atop Anchor.module.css) -
						    `td` is a Mantine style prop resolved straight to inline style, so it holds
						    regardless of that. */}
						<Menu.Dropdown>
							{canAccessDataPortal && (
								<>
									<Menu.Label>{t('user-menu.admin-options')}</Menu.Label>
									<Menu.Item
										component={Link}
										href='/admin'
										target='_self'
										variant={variant.Link.inheritStyle}
										td='none'
									>
										{t('user-menu.data-portal')}
									</Menu.Item>
									{isEditablePage && (
										<Menu.Item
											component={Link}
											onClick={handleEditModeEntry}
											target='_self'
											variant={variant.Link.inheritStyle}
											td='none'
										>
											{t('user-menu.edit-page')}
										</Menu.Item>
									)}
									<Menu.Divider />
									<Menu.Label>{t('user-menu.user-options')}</Menu.Label>
								</>
							)}
							<Menu.Item
								component={Link}
								href='/account/saved'
								target='_self'
								variant={variant.Link.inheritStyle}
								td='none'
							>
								{t('words.saved', { defaultValue: 'Saved' })}
							</Menu.Item>
							<Menu.Item
								component={Link}
								href='/account/reviews'
								target='_self'
								variant={variant.Link.inheritStyle}
								td='none'
							>
								{t('words.reviews')}
							</Menu.Item>
							<Menu.Item
								component={Link}
								href='/account'
								target='_self'
								variant={variant.Link.inheritStyle}
								td='none'
							>
								{t('words.settings')}
							</Menu.Item>
							<Menu.Item
								component={Link}
								external
								onClick={handleSignout}
								variant={variant.Link.inheritStyle}
								td='none'
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
				<SignupModalLauncher component={Button} className={classes.signupButton}>
					{t('sign-up-free')}
				</SignupModalLauncher>
			</>
		)
	}, [
		canAccessDataPortal,
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
		<Group className={cx(className)} wrap='nowrap' gap={shouldShowMenu ? 28 : 40}>
			<LangPicker />
			{menuOrLoginButtons}
		</Group>
	)
}

type UserMenuProps = { className?: string }
