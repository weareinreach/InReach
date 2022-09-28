import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import { StructureResolver } from "sanity/desk";
import { sanityI18nConfig } from "../sanity.config";
import { getFilteredDocumentTypeListItems } from "@sanity/document-internationalization";
// import { env } from "src/env/client.mjs";

export const structure: StructureResolver = (S, context) => {
	const { schema } = context;
	// const client = getClient({ apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION });
	const docTypeListItems = getFilteredDocumentTypeListItems({
		S,
		schema,
		config: sanityI18nConfig,
	}).filter(
		(listItem) => !["site-config", "navigation", "page"].includes(listItem.id)
	);

	return S.list()
		.title("Main")
		.items([
			...docTypeListItems,
			S.listItem()
				.title("Page Content")
				.schemaType("page")
				.child(
					S.documentList()
						.title("Pages")
						.filter("_type == 'page' && __i18n_lang == $baseLanguage")
						.params({ baseLanguage: `en-US` })
				),
			orderableDocumentListDeskItem({
				type: "navigation",
				title: "Site Navigation",
				id: "site-navigation",
				S,
				context,
			}),
			S.listItem()
				.title("Site Settings")
				.child(
					S.document().schemaType("site-config").documentId("site-config")
				),
			// S.listItem()
			// .title('Site Pages')
			// .child()
		]);
};
