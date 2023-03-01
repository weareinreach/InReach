/* eslint-disable import/no-unused-modules */
declare module '*.svg' {
	import React from 'react'

	export const ReactComponent: React.SFC<React.SVGProps<SVGSVGElement>>
	const src: string
	export default src
}
