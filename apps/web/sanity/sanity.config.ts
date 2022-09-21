import { createConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { schemaTypes } from "./schemas";
import {
	withDocumentI18nPlugin,
	getDocumentList,
} from "@sanity/document-internationalization";
import { internationalizedArray } from "sanity-plugin-internationalized-array";
import { visionTool } from "@sanity/vision";
import { colorInput } from "@sanity/color-input";
// import { media } from "sanity-plugin-media";

const devOnly = [
	visionTool({
		defaultApiVersion: "2021-09-19",
		defaultDataset: "production",
	}),
];

export default createConfig({
	name: "default",
	title: process.env.NODE_ENV === "production" ? "InReach" : "InReach Staging",
	projectId: "dwv4rfh3",
	dataset: process.env.NODE_ENV === "production" ? "production" : "staging",
	plugins: withDocumentI18nPlugin(
		(pluginConfig) => [
			deskTool({
				structure: (S, { schema }) =>
					getDocumentList({ S, schema, config: pluginConfig }),
			}),
			internationalizedArray({
				languages: [
					{ id: "en", title: "English" },
					{ id: "es", title: "Spanish" },
				],
				fieldTypes: ["string", "url"],
			}),
			colorInput(),
			// media(),
			...(process.env.NODE_ENV === "production" ? [] : devOnly),
		],
		{
			includeDeskTool: false,
			base: "en-US",
			languages: [
				{
					title: "English (US)",
					id: "en-US",
				},
				{
					title: "Spanish",
					id: "es",
				},
			],
			withTranslationsMaintenance: true,
			fieldNames: {
				lang: "__i18n_lang",
				references: "__i18n_refs",
				baseReference: "__i18n_base",
			},
		}
	),

	schema: {
		types: schemaTypes,
	},
});
