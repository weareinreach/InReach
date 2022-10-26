import { createConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { schemaTypes } from "./schemas";
import { documentI18n } from "@sanity/document-internationalization";
import { internationalizedArray } from "sanity-plugin-internationalized-array";
import { visionTool } from "@sanity/vision";
import { colorInput } from "@sanity/color-input";
// import { env } from "../src/env/client.mjs";
// import { media } from "sanity-plugin-media";
import { structure } from "./structure";
// import { SetSlugAndPublishAction } from "./actions/slug";

const devOnly = [
	visionTool({
		defaultApiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
		defaultDataset: "production",
	}),
];

export const sanityI18nConfig = {
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
	withTranslationsMaintenance: false,
	fieldNames: {
		lang: "__i18n_lang",
		references: "__i18n_refs",
		baseReference: "__i18n_base",
	},
};

export default createConfig({
	name: "default",
	title: process.env.NODE_ENV === "production" ? "InReach" : "InReach Staging",
	projectId: "dwv4rfh3",
	dataset: process.env.NODE_ENV === "production" ? "production" : "staging",
	basePath: "/sanity",
	plugins: [
		deskTool({
			structure,
		}),
		documentI18n(sanityI18nConfig),
		internationalizedArray({
			languages: sanityI18nConfig.languages,
			fieldTypes: ["string", "url"],
		}),
		colorInput(),
		// media(),
		...(process.env.NODE_ENV === "production" ? [] : devOnly),
	],
	schema: {
		types: schemaTypes,
		templates: [
			{
				id: "post",
				title: "Blog Post",
				schemaType: "post",
				value: (props: unknown) => props,
			},
			{
				id: "teamBio",
				title: "Team Member Bio",
				schemaType: "teamBio",
				value: (props: unknown) => props,
			},
		],
	},
	document: {
		// actions: (prev) =>
		// 	prev.map((previousAction) =>
		// 		previousAction.action === "publish"
		// 			? SetSlugAndPublishAction
		// 			: previousAction
		// 	),
		newDocumentOptions: () => {
			return [
				{
					templateId: "post",
					title: "Blog Post",
				},
				{
					templateId: "teamBio",
					title: "Team Member Bio",
				},
			];
		},
	},
});
