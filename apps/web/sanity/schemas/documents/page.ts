import { MasterDetailIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const page = defineType({
	name: "page",
	type: "document",
	title: "Page",
	initialValue: {
		__i18n_lang: "en-US",
	},
	i18n: true,
	icon: MasterDetailIcon,
	fieldsets: [
		{
			title: "SEO & metadata",
			name: "metadata",
		},
	],
	fields: [
		// defineField({
		// 	name: "title",
		// 	type: "string",
		// 	title: "Title",
		// }),
		defineField({
			name: "content",
			type: "array",
			title: "Page sections",
			of: [
				defineArrayMember({ type: "blockContent" }),
				defineArrayMember({
					name: "HeroCarousel",
					// title: "Hero (Carousel version)",
					type: "HeroCarousel",
				}),
			],
		}),
		defineField({
			name: "metadata",
			type: "metadata",
		}),
		// defineField({
		// 	name: "description",
		// 	type: "text",
		// 	title: "Description",
		// 	description: "This description populates meta-tags on the webpage",
		// 	fieldset: "metadata",
		// }),
		// defineField({
		// 	name: "openGraphImage",
		// 	type: "image",
		// 	title: "Open Graph Image",
		// 	description: "Image for sharing previews on Facebook, Twitter etc.",
		// 	fieldset: "metadata",
		// }),
	],
	preview: {
		select: {
			title: "metadata.title",
			media: "openGraphImage",
		},
	},
});
