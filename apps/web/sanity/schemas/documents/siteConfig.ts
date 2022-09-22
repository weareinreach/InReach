import { defineField, defineType } from "sanity";
import { SocialMediaIconSelect } from "@inreach/ui/components/web";

export const siteConfig = defineType({
	name: "site-config",
	title: "Site Configuration",
	type: "document",
	fieldsets: [
		{
			name: "footer",
			title: "Footer",
		},
	],
	fields: [
		defineField({
			name: "title",
			type: "string",
			title: "Site Title",
		}),
		defineField({
			title: "URL",
			name: "url",
			type: "url",
			description: "The main site url. Used to create canonical url",
		}),
		defineField({
			name: "frontpage",
			type: "reference",
			description: "Choose page to be the frontpage",
			to: { type: "page" },
		}),
		defineField({
			title: "Brand logo",
			description:
				"Best choice is to use an SVG where the color are set with currentColor",
			name: "logo",
			type: "image",
			fields: [
				{
					name: "alt",
					type: "internationalizedArrayString",
					title: "Alternative text",
					description: "Important for SEO and accessiblity.",
				},
			],
		}),

		defineField({
			title: "Social Media Links",
			name: "socialMediaLinks",
			type: "array",
			of: [
				defineField({
					name: "socialMediaLink",
					type: "object",
					fields: [
						defineField({
							name: "service",
							title: "Service",
							type: "string",
						}),
						{
							name: "href",
							title: "Profile Link",
							type: "url",
							validation: (Rule) =>
								Rule.uri({
									allowRelative: true,
									scheme: ["https", "http"],
								}),
						},

						defineField({
							name: "icon",
							title: "Icon",
							type: "string",
							components: {
								input: SocialMediaIconSelect,
							},
						}),
					],
				}),
			],
		}),
		defineField({
			title: "Footer navigation items",
			name: "footerNavigation",
			type: "array",
			validation: (Rule) => [
				Rule.max(10).warning("Are you sure you want more than 10 items?"),
				Rule.unique().error("You have duplicate menu items"),
			],
			fieldset: "footer",
			of: [
				{
					type: "reference",
					to: [{ type: "route" }],
				},
			],
		}),
		defineField({
			name: "footerText",
			type: "simplePortableText",
			fieldset: "footer",
		}),
	],
});
