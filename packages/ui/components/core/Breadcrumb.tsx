import { Text, createStyles, useMantineTheme, Button } from '@mantine/core'
import { Trans, useTranslation } from 'next-i18next'
import { MouseEventHandler } from 'react'

import { Icon } from '~ui/icon'

const useStyles = createStyles((theme) => ({
	root: {
		// height: '40px',
		width: 'auto',
		padding: [theme.spacing.sm - 2, theme.spacing.xs],
		color: theme.other.colors.secondary.black,
		backgroundColor: theme.other.colors.secondary.white,
		borderRadius: 5,
		'&:hover': {
			backgroundColor: theme.other.colors.primary.lightGray,
			textDecoration: 'none !important',
		},
	},
	icon: {
		width: 24,
		height: 24,
		marginRight: theme.spacing.xs,
	},
}))

export const Breadcrumb = ({ option, ...props }: BreadcrumbProps) => {
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
						return t('back-to-search')
					}
					case 'none': {
						return t('back')
					}
					case 'dynamicText': {
						const page = props.backToText
						return (
							<Trans i18nKey='back-to-dynamic' ns='common' values={{ page }}>
								Back to <span style={{ textDecoration: 'underline' }}>{page}</span>
							</Trans>
						)
					}
				}
			}
			default:
				return t('close')
		}
	})()

	return (
		<Button
			variant='subtle'
			classNames={{ root: classes.root, icon: classes.icon }}
			px={theme.spacing.sm - 2}
			py={theme.spacing.xs}
			onClick={props.onClick}
			leftIcon={<Icon icon={iconRender} height={24} color={theme.other.colors.secondary.black} />}
		>
			<Text size='md' fw={theme.other.fontWeight.semibold}>
				{childrenRender}
			</Text>
		</Button>
	)
}

type BreadcrumbProps = (Close | Back | BackToDynamic) & { onClick: MouseEventHandler<HTMLButtonElement> }
interface Close {
	option: 'close'
	backTo?: undefined
	backToText?: undefined
}

interface Back {
	option: 'back'
	backTo: 'search' | 'none'
	backToText?: undefined
}

interface BackToDynamic {
	option: 'back'
	backTo: 'dynamicText'
	backToText: string
}
