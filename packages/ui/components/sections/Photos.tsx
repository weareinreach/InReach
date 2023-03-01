import { type ApiOutput } from '@weareinreach/api'

export const PhotosSection = (props: PhotosSectionProps) => {
	return <></>
}

type PageQueryResult = NonNullable<ApiOutput['organization']['getBySlug']>

export type PhotosSectionProps = {
	photos: PageQueryResult['locations'][number]['photos'] | PageQueryResult['photos'][number]
}
