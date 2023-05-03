import { Button, createStyles, rem, Text, useMantineTheme } from '@mantine/core'
import { Trans, useTranslation } from 'next-i18next'
import { type MouseEventHandler } from 'react'

import { Icon } from '~ui/icon'

const useStyles = createStyles((theme) => ({
	root: {
		// height: '40px',
		maxWidth: '100%',
		padding: `calc(${theme.spacing.sm} - ${rem(2)}) ${theme.spacing.xs}`,
		color: theme.other.colors.secondary.black,
		backgroundColor: theme.other.colors.secondary.white,
		borderRadius: rem(5),
		'&:hover': {
			backgroundColor: theme.other.colors.primary.lightGray,
			textDecoration: 'none !important',
		},
	},
	icon: {
		width: rem(24),
		height: rem(24),
		marginRight: theme.spacing.xs,
	},
	buttonText: {},
}))

export const Breadcrumb = (props: BreadcrumbProps) => {
	const { option } = props
	const { classes } = useStyles()
	const theme = useMantineTheme()
	const { t } = useTranslation('common')
	const icons = {
		close: 'carbon:close',
		back: 'carbon:arrow-left',
	} as const
	const iconRender = icons[option]
	const childrenRender = (function () {
		switch (option) {
			case 'close': {
				return t('close')
			}
			case 'back': {
				switch (props.backTo) {
					case 'search': {
						return t('breadcrumb.back-to-search')
					}
					case 'none': {
						return t('words.back')
					}
					case 'dynamicText': {
						const page = props.backToText
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
	})()

	return (
		<Button
			variant='subtle'
			classNames={{ root: classes.root, icon: classes.icon }}
			px={`calc(${theme.spacing.sm} - ${rem(2)})`}
			py={theme.spacing.xs}
			onClick={props.onClick}
			leftIcon={<Icon icon={iconRender} height={24} color={theme.other.colors.secondary.black} />}
		>
			<Text size='md' fw={theme.other.fontWeight.semibold} truncate>
				{childrenRender}
			</Text>
		</Button>
	)
}

export type BreadcrumbProps = BreadcrumbTypes & {
	onClick: MouseEventHandler<HTMLButtonElement>
}
export type ModalTitleBreadcrumb = BreadcrumbTypes & {
	onClick?: MouseEventHandler<HTMLButtonElement>
}

export type BreadcrumbTypes = Close | Back | BackToDynamic
interface Close {
	option: 'close'
}

interface Back {
	option: 'back'
	backTo: 'search' | 'none'
}

interface BackToDynamic {
	option: 'back'
	backTo: 'dynamicText'
	backToText: string
}
