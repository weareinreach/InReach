import { Title, Text } from '@mantine/core'
import { type ApiOutput } from '@weareinreach/api'

import { Badge, Rating } from '~ui/components/core'

export const LocationCard = (props: LocationCardProps) => {
	return <></>
}

type PageQueryResult = NonNullable<ApiOutput['organization']['getBySlug']>

export type LocationCardProps = {
	location: PageQueryResult['locations'][number]
}
