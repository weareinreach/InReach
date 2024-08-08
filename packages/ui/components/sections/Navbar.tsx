import { Container, createStyles, Flex, Group, rem, UnstyledButton, useMantineTheme } from '@mantine/core'
import Image from 'next/image'
import { type NextRouter, useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useCallback } from 'react'

import { navbarEvent } from '@weareinreach/analytics/events'
import InReachLogo from '~ui/assets/inreach.svg'
import { Button } from '~ui/components/core/Button'
import { Link } from '~ui/components/core/Link'
import { MobileNav } from '~ui/components/core/MobileNav'
import { UserMenu } from '~ui/components/core/UserMenu'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { useEditMode } from '~ui/hooks/useEditMode'
import { useNewNotification } from '~ui/hooks/useNewNotification'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

const useStyles = createStyles((theme) => ({
	desktopNav: {
		minHeight: rem(64),
		boxShadow: theme.shadows.xs,
		marginBottom: rem(40),
		position: 'sticky',
		top: 0,
		left: 0,
		right: 0,
		zIndex: 150,
		backgroundColor: theme.other.colors.secondary.white,
		[theme.fn.smallerThan('sm')]: {
			display: 'none',
		},
	},
	mobileNav: {
		[theme.fn.largerThan('sm')]: {
			display: 'none',
		},
	},
	editBar: {
		background: `linear-gradient(180deg, ${theme.other.colors.secondary.white} 0%, ${theme.fn.lighten(
			theme.other.colors.tertiary.red,
			0.75
		)} 10%)`,
		padding: `${rem(8)} ${rem(128)} ${rem(8)} ${rem(64)}`,
		margin: `0 ${rem(-64)}`,
	},
	editBarButtonText: {
		...theme.other.utilityFonts.utility3,
		...theme.fn.hover({ backgroundColor: theme.other.colors.secondary.white }),
		padding: `${rem(4)} ${rem(8)}`,
		borderRadius: rem(8),
		'&:disabled': {
			color: theme.other.colors.secondary.darkGray,
			cursor: 'not-allowed',
			...theme.fn.hover({ backgroundColor: theme.other.colors.primary.lightGray }),
		},
	},
}))

const EditModeBar = () => {
	const { classes } = useStyles()
	const theme = useMantineTheme()
	const apiUtils = api.useUtils()
	const { unsaved, saveEvent } = useEditMode()
	const { t } = useTranslation('common')
	const router = useRouter<'/org/[slug]/edit' | '/org/[slug]/[orgLocationId]/edit'>()
	const { orgLocationId, slug, orgServiceId } = router.query
	const { mutate: revalidatePage } = api.misc.revalidatePage.useMutation()
	const apiQuery = (() => {
		switch (true) {
			case typeof orgServiceId === 'string': {
				return { orgServiceId, orgLocationId: undefined, slug: undefined }
			}
			case typeof orgLocationId === 'string': {
				return { orgLocationId, orgServiceId: undefined, slug: undefined }
			}
			default: {
				return { slug: slug as string, orgLocationId: undefined, orgServiceId: undefined }
			}
		}
	})()

	const { data } = api.component.EditModeBar.useQuery(apiQuery, {
		enabled: typeof orgLocationId === 'string' || typeof slug === 'string',
	})
	const reverifyNotification = useNewNotification({
		displayText: 'Organization reverification date has been updated.',
		icon: 'success',
	})
	const reverify = api.component.EditModeBarReverify.useMutation({
		onSuccess: () => {
			apiUtils.organization.invalidate()
			apiUtils.component.EditModeBar.invalidate()
			revalidatePage({ path: router.asPath.replace('/edit', '') })
			reverifyNotification()
		},
	})
	const publishedNotification = useNewNotification({
		displayText: `Published status has been set to: ${!data?.published}`,
		icon: 'success',
	})
	const publish = api.component.EditModeBarPublish.useMutation({
		onSuccess: () => {
			apiUtils.location.invalidate()
			apiUtils.organization.invalidate()
			apiUtils.component.EditModeBar.invalidate()
			revalidatePage({ path: router.asPath.replace('/edit', '') })
			publishedNotification()
		},
	})
	const deletedNotification = useNewNotification({
		displayText: `Deleted status has been set to: ${!data?.deleted}`,
		icon: 'success',
	})
	const updateDeleted = api.component.EditModeBarDelete.useMutation({
		onSuccess: () => {
			apiUtils.organization.invalidate()
			apiUtils.component.EditModeBar.invalidate()
			revalidatePage({ path: router.asPath.replace('/edit', '') })
			deletedNotification()
		},
	})
	const getExitEditPathname = useCallback((): NextRouter['pathname'] => {
		switch (router.pathname) {
			case '/org/[slug]/edit': {
				return '/org/[slug]'
			}
			case '/org/[slug]/[orgLocationId]/edit': {
				return '/org/[slug]/[orgLocationId]'
			}
			default: {
				return router.pathname
			}
		}
	}, [router.pathname])

	const handleExitEditMode = useCallback(() => {
		router.replace({ pathname: getExitEditPathname(), query: router.query })
	}, [getExitEditPathname, router])

	const handleReverify = useCallback(() => {
		slug && reverify.mutate({ slug })
	}, [reverify, slug])

	const handlePublishToggle = useCallback(
		() => publish.mutate({ ...apiQuery, published: !data?.published }),
		[publish, apiQuery, data?.published]
	)
	const handleDeleteToggle = useCallback(
		() => updateDeleted.mutate({ ...apiQuery, deleted: !data?.deleted }),
		[updateDeleted, apiQuery, data?.deleted]
	)

	return (
		<Group position='apart' noWrap className={classes.editBar}>
			<UnstyledButton className={classes.editBarButtonText} onClick={handleExitEditMode}>
				<Group noWrap spacing={8}>
					<Icon icon='carbon:arrow-left' height={20} />
					{t('exit.edit-mode')}
				</Group>
			</UnstyledButton>
			<Group noWrap>
				<UnstyledButton
					disabled={!unsaved.state}
					className={classes.editBarButtonText}
					onClick={saveEvent.save}
				>
					<Group noWrap spacing={8}>
						<Icon
							icon='mdi:content-save'
							height={20}
							color={!unsaved.state ? theme.other.colors.primary.allyGreen : undefined}
						/>
						{t('words.save-changes')}
					</Group>
				</UnstyledButton>
				{slug && !orgLocationId && (
					<UnstyledButton className={classes.editBarButtonText} onClick={handleReverify}>
						<Group noWrap spacing={8}>
							<Icon icon='carbon:checkmark-filled' color={theme.other.colors.primary.allyGreen} height={20} />
							{t('words.reverify')}
						</Group>
					</UnstyledButton>
				)}
				<UnstyledButton className={classes.editBarButtonText} onClick={handlePublishToggle}>
					<Group noWrap spacing={8}>
						<Icon icon={data?.published ? 'carbon:view-off' : 'carbon:view-filled'} height={20} />
						{t(data?.published ? 'words.unpublish' : 'words.publish')}
					</Group>
				</UnstyledButton>
				<UnstyledButton className={classes.editBarButtonText} onClick={handleDeleteToggle}>
					<Group noWrap spacing={8}>
						<Icon icon={data?.deleted ? 'fluent-mdl2:remove-from-trash' : 'carbon:trash-can'} height={20} />
						{t(data?.deleted ? 'words.restore' : 'words.delete')}
					</Group>
				</UnstyledButton>
			</Group>
		</Group>
	)
}

export const Navbar = () => {
	const { isEditMode } = useEditMode()
	const { t } = useTranslation('common')
	const { classes } = useStyles()
	const variants = useCustomVariant()
	const router = useRouter()
	return (
		<>
			<MobileNav className={classes.mobileNav} />
			<Container className={classes.desktopNav} fluid maw='100%'>
				<Flex justify='space-between' align='center' pt={5}>
					<Link href='/' target='_self' py={8}>
						<Image
							src={InReachLogo}
							width={100}
							height={38}
							alt={t('inreach-logo', { defaultValue: 'InReach logo' })}
							style={{ margin: 0 }}
						/>
					</Link>
					<Group spacing={40} noWrap align='center'>
						<UserMenu />
						<Link href='https://www.google.com' target='_self' variant={variants.Link.inheritStyle}>
							<Button variant='accent' onClick={navbarEvent.safetyExit} id='safety-exit'>
								{!router.isFallback && t('safety-exit')}
							</Button>
						</Link>
					</Group>
				</Flex>
				{isEditMode ? <EditModeBar /> : null}
			</Container>
		</>
	)
}
