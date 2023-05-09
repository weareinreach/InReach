import { useDebugValue, useEffect, useState } from 'react'

import { trpc as api } from '~ui/lib/trpcClient'

import { useSlug } from './useSlug'

export const useOrgId = () => {
	const pageSlug = useSlug()
	const [slug, setSlug] = useState<string>(pageSlug)
	const [orgId, setOrgId] = useState<string>()
	useDebugValue(slug)
	api.organization.getIdFromSlug.useQuery(
		{ slug },
		{
			enabled: Boolean(slug),
			onSuccess: (data) => setOrgId(data?.id),
			refetchOnWindowFocus: false,
		}
	)

	useEffect(() => {
		if (pageSlug !== slug) {
			setSlug(pageSlug)
		}
	}, [pageSlug])

	return orgId
}
