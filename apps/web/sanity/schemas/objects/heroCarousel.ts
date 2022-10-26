import { CtaPreview } from "@inreach/ui/components/web";
import { defineType, defineField, defineArrayMember } from "sanity";
import { groq } from "next-sanity";
import type { PortableTextProps } from "@portabletext/react";

export interface HeroCarouselReturn {
	_key: string;
	_type: string;
	text: PortableTextProps["value"];
}
[];

export const heroCarousel = defineType({
	name: "HeroCarousel",
	title: "Hero (Carousel Version)",
	type: "object",
	fields: [
		defineField({
			name: "KenBurns",
			title: "Ken Burns Effect?",
			type: "boolean",
		}),
		defineField({
			type: "heroCarouselSlides",
			name: "slides",
		}),
	],
});

export const heroCarouselSlides = defineType({
	name: "heroCarouselSlides",
	title: "Carousel Slides",
	type: "array",
	of: [
		defineArrayMember({
			name: "heroCarouselSlides",
			title: "Carousel Slides",
			type: "object",
			fields: [
				defineField({
					name: "image",
					title: "Background Image",
					type: "image",
				}),
				defineField({
					name: "text",
					title: "Overlay text",
					type: "array",
					of: [
						defineArrayMember({
							type: "block",
							styles: [],
							lists: [],
							marks: {
								decorators: [
									{ title: "Strong", value: "strong" },
									{ title: "Emphasis", value: "em" },
								],
								annotations: [
									/* It's a comment. */
								],
							},
						}),
						defineArrayMember({
							type: "CtaButton",
							components: {
								preview: CtaPreview,
							},
						}),
						defineArrayMember({ type: "ColorText" }),
					],
				}),
			],
		}),
	],
});

export const heroCarouselFragment = groq`
HeroCarousel[] {
	...,
	text[] {
		...,
		children[] {
			...,
			route-> {
				slug {
					current
				}
			}
		}
	}
}
`;
