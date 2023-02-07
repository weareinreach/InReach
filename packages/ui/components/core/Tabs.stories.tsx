import { Tabs } from '@mantine/core'
import { Meta } from '@storybook/react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

export default {
	title: 'Design System/Tabs',
	component: Tabs,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=51%3A472&t=BjLo5xm37wfL77nc-0',
		},
		nextjs: {
			router: {
				pathname: '/org/[slug]',
				asPath: '/org/mockOrg',
				query: {
					slug: 'mockOrg',
				},
			},
		},
	},
} as Meta<typeof Tabs>

export const TabsSample = () => {
	const router = useRouter()
	const { t } = useTranslation()

	return (
		<Tabs value={router.query.activeTab as string} onTabChange={(value) => router.push(`/tabs/${value}`)}>
			<Tabs.List>
				<Tabs.Tab value='services'>{t('services')}</Tabs.Tab>
				<Tabs.Tab value='photos'>{t('photos')}</Tabs.Tab>
				<Tabs.Tab value='reviews'>{t('reviews')}</Tabs.Tab>
			</Tabs.List>
		</Tabs>
	)
}
