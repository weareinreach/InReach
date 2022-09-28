import { defineType, defineField, SlugParent } from "sanity";
import { orderRankField } from "@sanity/orderable-document-list";
import { sanityClient } from "../../client";
import { groq } from "next-sanity";
import slugify from "slugify";

type I18n = {
	_key: string;
	value: string;
};
type NavSlugParent = {
	internal?: {
		_ref: string;
	};
	external?: string;
	label: {
		_key: string;
		value: string;
	}[];
} & SlugParent;

let homePage = "";
const getHomePage = async () => {
	const id = await sanityClient.fetch(
		groq`
		*[_type == 'site-config'][0].frontpage->._id
		`
	);
	homePage = id;
	return id;
};
getHomePage();

const getLabel = (parent: NavSlugParent) =>
	parent.label.filter((x) => x._key === "en-US")[0].value;

const slugGen = async (parent: NavSlugParent) => {
	homePage = await getHomePage();
	return `${getLabel(parent).toLowerCase()}`;
};

export const navigation = defineType({
	name: "navigation",
	type: "document",
	title: "Navigation Parent Items",
	description: "Select pages for the top menu",
	liveEdit: false,
	i18n: false,
	// orderings: [orderRankOrdering],
	preview: {
		select: {
			title: "parent.label",
			subItems: "children",
		},
		prepare: (value) => {
			const title: I18n[] = value.title;
			const subItems: Array<unknown> = value.subItems ?? [];
			const itemTitle = title.filter((item) => item._key === "en-US")[0].value;
			return {
				title: `${itemTitle ?? ""}`,
				subtitle: `Children: ${subItems.length}`,
			};
		},
	},
	fields: [
		orderRankField({ type: "navigation" }),
		defineField({
			name: "parent",
			title: "Menu Parent Heading",
			type: "object",
			fieldsets: [
				{
					name: "link",
					title: "Link to:",
				},
			],
			fields: [
				defineField({
					name: "label",
					title: "Label",
					type: "internationalizedArrayString",
				}),
				defineField({
					name: "slug",
					type: "slug",
					options: {
						source: async (doc, { parent }) => slugGen(parent as NavSlugParent),
						slugify: (input) => slugify(input.toLowerCase()),
					},
					hidden: ({ parent }) => {
						const link = parent?.internal?._ref ?? null;

						return link === homePage || !link;
					},
					validation: (Rule) =>
						Rule.custom(async (slug, opts) => {
							const parent: NavSlugParent = opts.parent as NavSlugParent;
							const link = parent?.internal?._ref ?? "";
							const extLink = parent?.external ?? "";
							const value = slug?.current ?? "";
							const generatedSlug = await slugGen(parent);
							if (extLink) return true;
							if (link === homePage) return true;
							if (value === (await slugify(generatedSlug))) return true;
							return "Please regenerate slug.";
						}),
				}),
				defineField({
					name: "internal",
					type: "reference",
					title: "Internal page",
					to: [{ type: "page" }],
					fieldset: "link",
					hidden: ({ parent, value }) => !value && !!parent?.external,
				}),
				defineField({
					name: "external",
					type: "url",
					title: "External URL",
					fieldset: "link",
					hidden: ({ parent, value }) => !value && !!parent?.internal,
				}),
			],
		}),
		defineField({
			name: "children",
			title: "Menu Child Items",
			type: "array",
			of: [
				{
					// name: "child",
					title: "Menu Subitem",
					type: "object",
					fieldsets: [
						{
							name: "link",
							title: "Link to:",
						},
					],
					fields: [
						defineField({
							name: "label",
							title: "Label",
							type: "internationalizedArrayString",
						}),
						defineField({
							name: "slug",
							type: "slug",
							options: {
								source: async (doc, { parent }) =>
									slugGen(parent as NavSlugParent),
								slugify: (input) => slugify(input.toLowerCase()),
								// disableArrayWarning: true,
							},
							hidden: ({ parent }) => {
								const link = parent?.internal?._ref ?? null;
								return link === homePage || !link;
							},
							validation: (Rule) =>
								Rule.custom(async (slug, opts) => {
									const parent: NavSlugParent = opts.parent as NavSlugParent;
									const extLink = parent?.external ?? "";
									const value = slug?.current ?? "";
									const generatedSlug = await slugGen(parent);
									if (extLink) return true;
									if (value === slugify(generatedSlug)) return true;
									return "Please regenerate slug.";
								}),
						}),
						defineField({
							name: "internal",
							type: "reference",
							title: "Internal page",
							to: [{ type: "page" }],
							fieldset: "link",
							hidden: ({ parent, value }) => !value && !!parent?.external,
						}),
						defineField({
							name: "external",
							type: "url",
							title: "External URL",
							fieldset: "link",
							hidden: ({ parent, value }) => !value && !!parent?.internal,
						}),
					],
					preview: {
						select: {
							subItem: "label",
						},
						prepare(value) {
							const { subItem }: Record<string, Array<I18n>> = value;
							const langs = subItem.map((item) => item._key);
							const itemTitle = subItem.filter(
								(item) => item._key === "en-US"
							)[0].value;
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
});
