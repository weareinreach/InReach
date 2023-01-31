import { Button, createStyles, Menu, Text, useMantineTheme } from '@mantine/core'
import { useTranslation } from 'next-i18next'

import { Icon } from '../../icon'

export const actionButtonIcons = {
	save: { icon: 'carbon:favorite', labelKey: 'save' },
	share: { icon: 'carbon:share', labelKey: 'share' },
	print: { icon: 'carbon:printer', labelKey: 'print' },
	delete: { icon: 'carbon:delete', labelKey: 'delete' },
	review: { icon: 'carbon:star', labelKey: 'review' },
} as const

const useStyles = createStyles((theme) => ({
	button: {
		color: theme.other.colors.secondary.black,

		'&:hover': {
			backgroundColor: theme.other.colors.primary.lightGray,
		},
	},
}))

export const ActionButtons = ({ iconKey }: Props) => {
	const { classes } = useStyles()
	const theme = useMantineTheme()
	const { t } = useTranslation()
	const iconRender = actionButtonIcons[iconKey]

	return <Button leftIcon={<Icon icon={iconRender.icon} />}>{t(iconRender.labelKey)}</Button>
}

type Props = {
	iconKey: keyof typeof actionButtonIcons
}
