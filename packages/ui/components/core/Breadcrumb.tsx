import { createStyles, Group, rem, Text, UnstyledButton, useMantineTheme } from '@mantine/core'
import { useRouter } from 'next/router'
import { Trans, useTranslation } from 'next-i18next'
import { type MouseEvent, type MouseEventHandler, useCallback, useMemo } from 'react'

import { useScreenSize } from '~ui/hooks/useScreenSize'
import { useSearchState } from '~ui/hooks/useSearchState'
import { Icon } from '~ui/icon'

const useStyles = createStyles((theme) => ({
	root: {
		height: rem(40),
		maxWidth: '100%',
		padding: `${rem(10)} ${rem(8)}`,
		color: theme.other.colors.secondary.black,
		backgroundColor: theme.other.colors.secondary.white,
		borderRadius: rem(8),
		'&:hover': {
			backgroundColor: theme.other.colors.primary.lightGray,
			textDecoration: 'none !important',
		},
		...theme.fn.hover({
			backgroundColor: `${theme.other.colors.primary.lightGray} !important`,
			textDecoration: 'none !important',
		}),
	},
	icon: {
		width: rem(24),
		height: rem(24),
		// marginRight: theme.spacing.xs,
	},
	buttonText: {},
}))

const isString = (val: unknown): val is string => typeof val === 'string'

export const Breadcrumb = (props: BreadcrumbProps) => {
	const { option, backTo, backToText, onClick, children } = props
	const { classes } = useStyles()
	const theme = useMantineTheme()
	const { t } = useTranslation('common')
	const router = useRouter()
	const { searchStateActions } = useSearchState()
	const { isMobile } = useScreenSize()

	const backButtonClickHandler = useCallback(() => {
		if (backTo === 'search') {
			const query = searchStateActions.getRoute()
			if (query) {
				router.push({
					pathname: '/search/[...params]',
					query,
				})
			}
		}
		if (backTo === 'dynamicText' && router.pathname.startsWith('/org/[slug]/[orgLocationId]')) {
			const { orgLocationId, slug } = router.query
			if (isString(slug) && isString(orgLocationId)) {
				router.push({
					pathname: router.pathname.endsWith('/edit') ? '/org/[slug]/edit' : '/org/[slug]',
					query: { slug },
				})
			}
		}
	}, [backTo, router, searchStateActions])

	const handleClick = useCallback(
		(e: MouseEvent<HTMLButtonElement>) => {
			if (onClick instanceof Function) {
				onClick(e)
			} else if (option === 'back') {
				backButtonClickHandler()
			}
		},
		[backButtonClickHandler, onClick, option]
	)

	const icons = {
		close: 'carbon:close',
		back: 'carbon:arrow-left',
	} as const
	const iconRender = icons[option]
	const childrenRender = useMemo(() => {
		switch (option) {
			case 'close': {
				return t('common:words.close')
			}
			case 'back': {
				switch (backTo) {
					case 'search': {
						return t('common:breadcrumb.back-to-search')
					}
					case 'none': {
						return t('common:words.back')
					}
					case 'dynamicText': {
						const page = backToText
						if (isMobile) {
							return t('common:words.back')
						}
						return (
							<Trans
								i18nKey='breadcrumb.back-to-dynamic'
								ns='common'
								values={{ page }}
								shouldUnescape={true}
								components={{ u: <u>.</u> }}
							/>
						)
					}
				}
			}
			// eslint-disable-next-line no-fallthrough
			default:
				return t('close')
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [option, backTo, backToText, isMobile])

	return (
		<UnstyledButton className={classes.root} onClick={handleClick}>
			<Group spacing={8} noWrap>
				<Icon
					icon={iconRender}
					height={24}
					color={theme.other.colors.secondary.black}
					className={classes.icon}
				/>
				<Text size='md' fw={theme.other.fontWeight.semibold} truncate m={0}>
					{children || childrenRender}
				</Text>
			</Group>
		</UnstyledButton>
	)
}

export const isValidBreadcrumbProps = (props: PossibleBreadcrumbProps): props is BreadcrumbProps => {
	if (props.option === 'close') {
		return true
	} else if (props.option === 'back') {
		if (props.backTo === 'dynamicText') {
			if (typeof props.onClick === 'function' && typeof props.backToText === 'string') {
				return true
			}
		} else if (props.backTo === 'none' || props.backTo === 'search') {
			return true
		}
	}
	return false
}
type PossibleBreadcrumbProps = {
	option: string
	onClick?: MouseEventHandler<HTMLButtonElement>
	backTo?: string
	backToText?: string
}
export type ModalTitleBreadcrumb = Omit<BreadcrumbProps, 'onClick'> & {
	onClick: MouseEventHandler<HTMLButtonElement>
}
export type BreadcrumbProps = (Close | Back | BackToDynamic) & { children?: React.ReactNode }
interface Close {
	option: 'close'
	onClick: MouseEventHandler<HTMLButtonElement>
	backTo?: never
	backToText?: never
}

interface Back {
	option: 'back'
	onClick?: MouseEventHandler<HTMLButtonElement>
	backTo: 'search' | 'none'
	backToText?: never
}

interface BackToDynamic {
	option: 'back'
	onClick?: MouseEventHandler<HTMLButtonElement>
	backTo: 'dynamicText'
	backToText: string
}
