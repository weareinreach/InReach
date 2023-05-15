import { useDebugValue, useEffect, useState } from 'react'

import { trpc as api } from '~ui/lib/trpcClient'

import { useSlug } from './useSlug'

export const useOrgInfo = () => {
	const pageSlug = useSlug()
	const [slug, setSlug] = useState<string>(pageSlug)
	const [orgId, setOrgId] = useState<string>()
	useDebugValue(slug)
	const { data, isLoading } = api.organization.getIdFromSlug.useQuery(
		{ slug },
		{
			enabled: Boolean(slug),
			refetchOnWindowFocus: false,
		}
	)

	useEffect(() => {
		if (pageSlug !== slug) {
			setSlug(pageSlug)
		}
	}, [pageSlug, slug])

	useEffect(() => {
		if (data && !isLoading && data.id !== orgId) setOrgId(data.id)
	}, [data, isLoading, orgId])

	return { id: orgId, slug }
}
