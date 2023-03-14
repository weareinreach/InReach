import { Grid, Text, Title, Group, Stack } from '@mantine/core'
import { type ApiOutput } from '@weareinreach/api'
import { useTranslation } from 'next-i18next'

import { useScreenSize, useCustomVariant } from '~ui/hooks'

export const PhotosSection = (props: PhotosSectionProps) => {
	const { t } = useTranslation('common')
	const variants = useCustomVariant()
	const { isMobile } = useScreenSize()
	return (
		// <Grid.Col sm={8}>
		<Stack spacing={isMobile ? 32 : 40} align='flex-start'>
			<Group h={48}>
				<Title order={2}>{t('photo', { count: 2 })}</Title>
			</Group>
			<Text variant={variants.Text.darkGray}>
				{t('photo_interval', { count: 0, postProcess: 'interval' })}
			</Text>
		</Stack>
		// </Grid.Col>
	)
}

type PageQueryResult = NonNullable<ApiOutput['organization']['getBySlug']>

export type PhotosSectionProps = {
	photos: PageQueryResult['locations'][number]['photos'] | PageQueryResult['photos'][number]
}
