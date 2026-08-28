declare module '*.svg' {
	import type React from 'react'

	export const ReactComponent: React.SFC<React.SVGProps<SVGSVGElement>>
	const src: string
	export default src
}

declare module '*.module.css' {
	// `noUncheckedIndexedAccess` would make every class-name access `string | undefined`
	// with a real index signature here - there's no per-file codegen validating exact
	// keys anyway, so this intentionally trades that for the same ergonomics
	// `createStyles()`'s returned `classes` object used to have.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const classes: any
	export default classes
}
