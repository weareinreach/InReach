import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import { StructureResolver } from "sanity/desk";
import { sanityI18nConfig } from "../sanity.config";
import { getFilteredDocumentTypeListItems } from "@sanity/document-internationalization";

export const structure: StructureResolver = (S, context) => {
	const { schema, client } = context;
	const docTypeListItems = getFilteredDocumentTypeListItems({
		S,
		schema,
		config: sanityI18nConfig,
	}).filter((listItem) => !["site-config", "navigation"].includes(listItem.id));

	return S.list()
		.title("Main")
		.items([
			//i18n config
			...docTypeListItems,
			S.listItem()
				.title("Site Navigation")
				.child(
					S.document().schemaType("navigation").documentId("site-navigation")
				),
			S.listItem()
				.title("Site Settings")
				.child(
					S.document().schemaType("site-config").documentId("site-config")
				),
		]);
};
