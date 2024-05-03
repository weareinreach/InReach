import dynamic from 'next/dynamic'
import { useSession } from 'next-auth/react'

import { isLocalDev, isVercelDev, isVercelProd } from '@weareinreach/env/checks'

const ReactQueryDevtools = dynamic(
	() => import('@tanstack/react-query-devtools/production').then((mod) => mod.ReactQueryDevtools),
	{ ssr: false }
)

export const ConditionalReactQueryDevtool = () => {
	const { data: session, status: authStatus } = useSession()
	const isLoggedIn = !!session && authStatus === 'authenticated'
	// don't do anything on server or if we're in prod
	if (typeof window === 'undefined' || isVercelProd) {
		return null
	}

	if (isLocalDev || (isVercelDev && isLoggedIn)) {
		return <ReactQueryDevtools initialIsOpen={false} toggleButtonProps={{ style: { zIndex: 99998 } }} />
	}
	return null
}
