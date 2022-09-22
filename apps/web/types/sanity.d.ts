import type {} from "sanity";

declare module "sanity" {
	declare namespace Schema {
		export interface DocumentDefinition {
			i18n?: boolean;
		}
	}
}
