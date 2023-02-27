import { type ApiOutput } from '@weareinreach/api'

export const SearchResultCard = ({ result }: SearchResultCardProps) => {
	return <></>
}

export type SearchResultCardProps = {
	result: NonNullable<ApiOutput['organization']['getSearchDetails']>[number]
}
