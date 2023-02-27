import { type ApiOutput } from '@weareinreach/api'

export const ServicesInfoCard = (props: ServicesInfoCardProps) => {
	return <></>
}

type PageQueryResult = NonNullable<ApiOutput['organization']['getBySlug']>

export type ServicesInfoCardProps = {
	services: PageQueryResult['locations'][number]['services'] | PageQueryResult['services'][number]
}
