import { Stack, Title, Text, Grid, Card } from '@mantine/core'
import { type ApiOutput } from '@weareinreach/api'
import { useTranslation } from 'next-i18next'

import { Badge } from '~ui/components/core'
import { useCustomVariant, useScreenSize } from '~ui/hooks'

const ServiceSection = () => <Stack></Stack>

export const ServicesInfoCard = (props: ServicesInfoCardProps) => {
	const { t } = useTranslation()
	const { isMobile } = useScreenSize()
	const { services } = props

	const body = <></>

	return <Grid.Col>{isMobile ? body : <Card>{body}</Card>}</Grid.Col>
}

type PageQueryResult = NonNullable<ApiOutput['organization']['getBySlug']>

export type ServicesInfoCardProps = {
	services: PageQueryResult['locations'][number]['services'] | PageQueryResult['services']
}
