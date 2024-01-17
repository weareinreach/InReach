/// <reference types="@welldone-software/why-did-you-render" />
import React from 'react'

// eslint-disable-next-line node/no-process-env
if (process.env.NODE_ENV === 'development') {
	if (typeof window !== 'undefined') {
		const loadWdyr = async () => {
			// eslint-disable-next-line import/no-extraneous-dependencies
			const { default: whyDidYouRender } = await import('@welldone-software/why-did-you-render')
			whyDidYouRender(React, {
				trackAllPureComponents: true,
				include: [/.*/],
				exclude: [/.*mantine.*/i],
				logOnDifferentValues: false,
				logOwnerReasons: true,
				collapseGroups: true,
			})
		}
		//loadWdyr()
	}
}
