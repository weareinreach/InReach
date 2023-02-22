import { Tabs as MantineTabs } from '@mantine/core'
import { Meta } from '@storybook/react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

const Story = () => {
	const router = useRouter()
	const { t } = useTranslation()

	return (
		<MantineTabs
			defaultValue={router.query.activeTab as string}
			onTabChange={(value) => {
				router.push({ pathname: '/', query: { tab: value ?? '' } })
			}}
		>
			<MantineTabs.List>
				<MantineTabs.Tab value='services'>{t('services')}</MantineTabs.Tab>
				<MantineTabs.Tab value='photos'>{t('photos')}</MantineTabs.Tab>
				<MantineTabs.Tab value='reviews'>{t('reviews')}</MantineTabs.Tab>
			</MantineTabs.List>
		</MantineTabs>
	)
}

export default {
	title: 'Design System/Tabs',
	component: Story,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=51%3A472&t=BjLo5xm37wfL77nc-0',
		},
		nextjs: {
			router: {
				pathname: '/tabs/',
				query: {
					activeTab: 'services',
				},
			},
		},
	},
} satisfies Meta<typeof MantineTabs>

export const Tabs = {}
