import { Tabs } from '@mantine/core'
import { Meta } from '@storybook/react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import React from 'react'

export default {
	title: 'Design System/Tabs',
	component: Tabs,
} as Meta<typeof Tabs>

export const TabBarSample = {
	Render: () => {
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
	},
}
