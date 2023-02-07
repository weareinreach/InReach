import { ActionIcon, Group, Text, createStyles, useMantineTheme } from '@mantine/core'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'

import { Icon } from '~ui/icon'

const approvedOptions = {
	close: { children: 'close', icon: 'carbon:close', title: 'close' },
	back: { children: 'back-to-search', icon: 'carbon:arrow-left', title: 'back button' },
} as const

const useStyles = createStyles((theme) => ({
	container: {
		height: '40px',
		width: 'auto',
		paddingLeft: '11px',
		paddingRight: '8px',
		paddingTop: '10px',
		paddingBottom: '10px',
		color: theme.other.colors.secondary.black,
		'&:hover': {
			backgroundColor: theme.other.colors.primary.lightGray,
		},
	},
	icon: {
		width: '20px',
		height: '20px',
	},
}))

export const Breadcrumb = ({ href, option }: Props) => {
	const { classes } = useStyles()
	const theme = useMantineTheme()
	const { t } = useTranslation('common')
	const iconRender = approvedOptions[option].icon
	const childrenRender = approvedOptions[option].children
	return (
		<ActionIcon
			component={Link}
			href={href}
			title={approvedOptions[option].title}
			radius={5}
			className={classes.container}
		>
			<Group position='center' spacing='xs'>
				<Icon icon={iconRender} className={classes.icon} />
				<Text size='sm' fw={theme.other.fontWeight.semibold}>
					{t(childrenRender)}
				</Text>
			</Group>
		</ActionIcon>
	)
}

type Props = {
	href: string
	option: keyof typeof approvedOptions
}
