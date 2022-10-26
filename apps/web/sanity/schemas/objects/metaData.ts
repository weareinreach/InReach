import { ConditionalPropertyCallbackContext, defineField } from "sanity";

/**
 * It returns false if the document is a blog post
 * @param  - `{document: SanityDocument}` - This is the document that is being queried.
 */
const falseIfBlog = (context: ConditionalPropertyCallbackContext) =>
	context.document?._type !== "post";
const trueIfBlog = (context: ConditionalPropertyCallbackContext) =>
	context.document?._type === "post";

export const metaData = defineField({
	name: "metadata",
	title: "SEO & Metadata",
	type: "object",
	fieldsets: [
		{ title: "Page Info", name: "pageinfo" },
		{ title: "SEO", name: "seo" },
	],
	fields: [
		defineField({
			name: "title",
			title: "Title",
			type: "string",
			fieldset: "pageinfo",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "author",
			title: "Author",
			type: "reference",
			to: { type: "author" },
			hidden: (context) => falseIfBlog(context),
		}),
		defineField({
			name: "categories",
			title: "Categories",
			type: "array",
			of: [{ type: "reference", to: { type: "category" } }],
			hidden: (context) => falseIfBlog(context),
		}),
		defineField({
			name: "publishedAt",
			title: "Published at",
			type: "datetime",
			hidden: (context) => falseIfBlog(context),
		}),
		defineField({
			name: "slug",
			title: "Slug",
			type: "string",
			fieldset: "pageinfo",
			hidden: true,
		}),

		defineField({
			name: "seo",
			title: "SEO",
			type: "object",
			fields: [
				defineField({
					name: "openGraphImage",
					type: "image",
					title: "Open Graph Image",
					description: "Image for sharing previews on Facebook, Twitter etc.",
				}),
				defineField({
					name: "description",
					type: "text",
					title: "Description",
					description: "This description populates meta-tags on the webpage",
				}),
				defineField({
					name: "includeInSitemap",
					type: "boolean",
					title: "Include page in sitemap",
					description: "For search engines. Will be added to /sitemap.xml",
				}),
				defineField({
					name: "disallowRobots",
					type: "boolean",
					title: "Disallow in robots.txt",
					description: "Hide this route for search engines",
				}),
			],
		}),
	],
});
