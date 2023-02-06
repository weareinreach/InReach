import { createStyles, Tabs, useMantineTheme } from '@mantine/core'
import { useTranslation } from 'next-i18next'

const useStyles = createStyles((theme) => ({
	tab: {
		'&[data-active]': {
			borderColor: theme.other.colors.secondary.softBlack,
		},
		'&[data-active]:hover': {
			borderColor: theme.other.colors.secondary.softBlack,
		},
	},
	tabLabel: {
		fontWeight: 500,
		fontSize: '16px',
		color: theme.other.colors.secondary.softBlack,
	},
}))

export const TabsMenu = ({}) => {
	const { classes } = useStyles()
	const theme = useMantineTheme()
	const { t } = useTranslation()

	return (
		<Tabs defaultValue='services' classNames={classes}>
			<Tabs.List>
				<Tabs.Tab value='services'>{t('services')}</Tabs.Tab>
				<Tabs.Tab value='photos'>{t('photos')}</Tabs.Tab>
				<Tabs.Tab value='reviews'>{t('reviews')}</Tabs.Tab>
			</Tabs.List>

			<Tabs.Panel value='services' pt='xs'>
				Services tab content
			</Tabs.Panel>

			<Tabs.Panel value='photos' pt='xs'>
				Photos tab content
			</Tabs.Panel>

			<Tabs.Panel value='reviews' pt='xs'>
				Reviews tab content
			</Tabs.Panel>
		</Tabs>
	)
}
