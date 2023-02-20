import { ActionIcon, Group, Text, createStyles, useMantineTheme, Button } from '@mantine/core'
import Link, { type LinkProps } from 'next/link'
import { useTranslation } from 'next-i18next'

import { Icon } from '~ui/icon'

const approvedOptions = {
	close: { children: 'close', icon: 'carbon:close', title: 'close' },
	back: { children: 'back-to-search', icon: 'carbon:arrow-left', title: 'back button' },
} as const

const useStyles = createStyles((theme) => ({
	root: {
		// height: '40px',
		width: 'auto',
		padding: [theme.spacing.sm - 2, theme.spacing.xs],
		color: theme.other.colors.secondary.black,
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

export const Breadcrumb = ({ href, option }: Props) => {
	const { classes } = useStyles()
	const theme = useMantineTheme()
	const { t } = useTranslation('common')
	const iconRender = approvedOptions[option].icon
	const childrenRender = approvedOptions[option].children
	return (
		<Button
			component={Link}
			variant='subtle'
			href={href}
			title={approvedOptions[option].title}
			classNames={{ root: classes.root, icon: classes.icon }}
			px={theme.spacing.sm - 2}
			py={theme.spacing.xs}
			leftIcon={<Icon icon={iconRender} height={24} color={theme.other.colors.secondary.black} />}
		>
			<Text size='md' fw={theme.other.fontWeight.semibold}>
				{t(childrenRender)}
			</Text>
		</Button>
	)
}

type Props = {
	href: LinkProps['href']
	option: keyof typeof approvedOptions
}
