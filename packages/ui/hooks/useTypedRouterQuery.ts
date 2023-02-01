import { useRouter, NextRouter } from 'next/router'
import { z } from 'zod'

/**
 * It takes a {@link https://zod.dev/ Zod} schema and returns a router object with the query parsed according
 * to the schema
 *
 * @param schema - The schema to use to parse the query.
 * @returns The return type is inferred from the schema.
 */
export const useTypedRouterQuery = <T extends z.Schema>(
	schema: T
): Omit<NextRouter, 'query'> & { query: z.infer<T> } => {
	const { query, ...router } = useRouter()

	return {
		query: schema.parse(query) as z.infer<typeof schema>,
		...router,
	}
}
