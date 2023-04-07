import { useRouter } from 'next/router'

const isString = (string: unknown): string is string => typeof string === 'string'

export const useSlug = () => {
	const { query } = useRouter()
	const { slug } = query

	if (!isString(slug)) throw new Error('Cannot get slug', { cause: query })

	return slug
}
