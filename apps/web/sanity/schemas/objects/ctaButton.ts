import { defineField } from "sanity";

export const ctaButton = defineField({
	title: "Call to Action Button",
	name: "CtaButton",
	type: "object",

	fields: [
		defineField({
			title: "Button Text",
			name: "title",
			type: "string",
		}),
		defineField({ name: "href", title: "Link destination", type: "NextLink" }),
	],
	// preview: {
	// 	select: {
	// 		title: "title",
	// 		routeTitle: "page.title",
	// 		slug: "page.slug.current",
	// 		link: "link",
	// 	},
	// 	prepare({ title, routeTitle = "", slug, link }) {
	// 		console.log(title);
	// 		const subtitleExtra = slug
	// 			? `Slug:/${slug}/`
	// 			: link
	// 			? `External link: ${link}`
	// 			: "Not set";
	// 		return {
	// 			title: `${title}`,
	// 			subtitle: `${routeTitle} ${subtitleExtra}`,
	// 			href: `${slug ?? link}`,
	// 		};
	// 	},
	// },
});
