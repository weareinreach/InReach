import '@sanity/types'

declare module '@sanity/types' {
	declare namespace Schema {
		export interface DocumentDefinition {
			i18n?: boolean
		}
	}
}
export {}
