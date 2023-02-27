import { type ApiOutput } from '@weareinreach/api'

export const LocationCard = (props: LocationCardProps) => {
	return <></>
}

type PageQueryResult = NonNullable<ApiOutput['organization']['getBySlug']>

export type LocationCardProps = {
	location: PageQueryResult['locations'][number]
}
