import { defineType, defineField } from "sanity";

type I18n = {
	_key: string;
	value: string;
};

export const navigation = defineType({
	name: "navigation",
	type: "document",
	title: "Main Navigation",
	description: "Select pages for the top menu",
	liveEdit: false,
	preview: {
		select: {
			menuTop: "mainNavigation",
		},
		prepare() {
			return {
				title: `Site Navigation`,
			};
		},
	},
	fields: [
		defineField({
			title: "Main navigation",
			name: "mainNavigation",

			type: "array",
			of: [
				{
					name: "menu",
					title: "Menu Header",
					type: "object",
					fields: [
						defineField({
							name: "menuLabel",
							title: "Label",
							type: "internationalizedArrayString",
						}),
						defineField({
							name: "menuPageLink",
							type: "reference",
							to: [{ type: "page" }],
						}),
						defineField({
							name: "subMenu",
							title: "Menu Subitems",
							type: "array",
							of: [
								{
									name: "subMenuItem",
									title: "Menu Subitem",
									type: "object",
									fields: [
										defineField({
											name: "subMenuItemLabel",
											title: "Label",
											type: "internationalizedArrayString",
											validation: (Rule) => Rule.required(),
										}),
										defineField({
											name: "subMenuItemLink",
											type: "reference",
											to: [{ type: "page" }],
											validation: (Rule) => Rule.required(),
										}),
									],
									preview: {
										select: {
											subItem: "subMenuItemLabel",
										},
										prepare(value) {
											const { subItem }: Record<string, Array<I18n>> = value;
											const langs = subItem.map((item) => item._key);
											const itemTitle = subItem.filter(
												(item) => item._key === "en"
											)[0].value;
											console.log(itemTitle);
											return {
												title: `${itemTitle ?? ""}`,
												subtitle: `Label translations: ${langs.join(", ")}`,
											};
										},
									},
								},
							],
						}),
					],
					preview: {
						select: {
							title: "menuLabel",
							subItems: "subMenu",
						},
						prepare: (value) => {
							const title: I18n[] = value.title;
							const subItems: Array<unknown> = value.subItems ?? [];
							const langs = title.map((item) => item._key);
							const itemTitle = title.filter((item) => item._key === "en")[0]
								.value;
							return {
								title: `${itemTitle ?? ""}`,
								subtitle: `Menu child items: ${
									subItems.length
								} | Label translations: ${langs.join(", ")}.`,
							};
						},
					},
				},
			],
		}),
	],
});
