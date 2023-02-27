import { type ApiOutput } from '@weareinreach/api'

export const VisitCard = (props: VisitCardProps) => {
	return <></>
}

type PageQueryResult = NonNullable<ApiOutput['organization']['getBySlug']>

export type VisitCardProps = {
	location: PageQueryResult['locations'][number]
}
