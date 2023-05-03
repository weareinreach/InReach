import { useRouter } from 'next/router'
import { type z } from 'zod'

export const useTypedRouter = <T extends z.Schema>(schema: T) => {
	const { query, ...router } = useRouter()

	return {
		query: schema.parse(query) as z.infer<typeof schema>,
		...router,
	}
}
