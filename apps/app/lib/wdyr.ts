/* eslint-disable node/no-process-env */
/// <reference types="@welldone-software/why-did-you-render" />
import React from 'react'

if (
	process.env.NODE_ENV === 'development' &&
	(!!process.env.WDYR || process.env.NEXT_PUBLIC_WDYR === 'true')
) {
	if (typeof window !== 'undefined') {
		const loadWdyr = async () => {
			console.info('[WDYR] Loading plugin...')
			const { default: whyDidYouRender } = await import('@welldone-software/why-did-you-render')
			whyDidYouRender(React, {
				trackAllPureComponents: false,
				include: [/.*/],
				exclude: [/.*(?:mantine|ReactQueryDevtoolsPanel).*/i],
				logOnDifferentValues: false,
				logOwnerReasons: true,
				collapseGroups: true,
			})
		}
		loadWdyr()
	}
}
