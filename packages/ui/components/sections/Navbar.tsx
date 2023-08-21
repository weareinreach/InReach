import { Container, createStyles, Flex, Group, rem, UnstyledButton, useMantineTheme } from '@mantine/core'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import InReachLogo from '~ui/assets/inreach.svg'
import { Button } from '~ui/components/core/Button'
import { Link } from '~ui/components/core/Link'
import { MobileNav } from '~ui/components/core/MobileNav'
import { UserMenu } from '~ui/components/core/UserMenu'
import { useCustomVariant, useEditMode, useScreenSize } from '~ui/hooks'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

const useStyles = createStyles((theme) => ({
	desktopNav: {
		minHeight: rem(64),
		boxShadow: theme.shadows.xs,
		marginBottom: rem(40),
		[theme.fn.smallerThan('sm')]: {
			display: 'none',
		},
		position: 'sticky',
		top: 0,
		left: 0,
		right: 0,
		zIndex: 10000,
		backgroundColor: theme.other.colors.secondary.white,
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
	const { canSave, handleEditSubmit } = useEditMode()
	const { t } = useTranslation('common')
	const router = useRouter()
	const { orgLocationId, slug } = router.query
	const { data, isLoading } = api.misc.forEditNavbar.useQuery(
		orgLocationId ? { orgLocationId: orgLocationId as string } : { slug: slug as string },
		{
			enabled: typeof orgLocationId === 'string' || typeof slug === 'string',
		}
	)

	return (
		<Group position='apart' noWrap className={classes.editBar}>
			<UnstyledButton className={classes.editBarButtonText} onClick={router.back}>
				<Group noWrap spacing={8}>
					<Icon icon='carbon:arrow-left' height={20} />
					{t('exit.edit-mode')}
				</Group>
			</UnstyledButton>
			<Group noWrap>
				<UnstyledButton
					disabled={!canSave}
					className={classes.editBarButtonText}
					onClick={() => handleEditSubmit(() => console.log('save action from toolbar'))}
				>
					<Group noWrap spacing={8}>
						<Icon
							icon='mdi:content-save'
							height={20}
							color={canSave ? theme.other.colors.primary.allyGreen : undefined}
						/>
						{t('words.save-changes')}
					</Group>
				</UnstyledButton>
				{slug && !orgLocationId && (
					<UnstyledButton className={classes.editBarButtonText}>
						<Group noWrap spacing={8}>
							<Icon icon='carbon:checkmark-filled' color={theme.other.colors.primary.allyGreen} height={20} />
							{t('words.reverify')}
						</Group>
					</UnstyledButton>
				)}
				<UnstyledButton className={classes.editBarButtonText}>
					<Group noWrap spacing={8}>
						<Icon icon={data?.published ? 'carbon:view-off' : 'carbon:view-filled'} height={20} />
						{t(data?.published ? 'words.unpublish' : 'words.publish')}
					</Group>
				</UnstyledButton>
				<UnstyledButton className={classes.editBarButtonText}>
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
	const { isMobile, isTablet } = useScreenSize()

	return isMobile || isTablet ? (
		<MobileNav className={classes.mobileNav} />
	) : (
		<>
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
							<Button variant='accent'>{t('safety-exit')}</Button>
						</Link>
					</Group>
				</Flex>
				{isEditMode ? <EditModeBar /> : null}
			</Container>
		</>
	)
}

type NavbarProps = {
	editMode?: boolean
	editModeRef?: {
		handleEditSubmit: (handler: () => void) => void
	}
}
