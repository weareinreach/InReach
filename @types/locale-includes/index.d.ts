declare module 'locale-includes' {
	declare function localeIncludes(
		string: string,
		searchString: string,
		options?: {
			position?: number
			locales?: string | string[]
		} & Intl.CollatorOptions
	): boolean
	// export = localeIncludes
}
