import { SocialMediaIconSelect } from "@inreach/ui/components/web";
import { defineArrayMember, defineField, defineType } from "sanity";

export const teamBio = defineType({
	name: "teamBio",
	title: "Team Member Bio",
	type: "document",
	i18n: true,
	fields: [
		defineField({
			name: "name",
			title: "Name",
			type: "string",
		}),
		defineField({
			name: "slug",
			title: "Slug",
			type: "slug",
			options: {
				source: "name",
				maxLength: 96,
			},
		}),
		defineField({
			name: "class",
			type: "string",
			title: "Team member type",
			options: {
				list: [
					{
						value: "staff",
						title: "Staff",
					},
					{
						value: "intern",
						title: "Intern",
					},
					{
						value: "volunteer",
						title: "Volunteer",
					},
					{
						value: "board",
						title: "Board of Directors",
					},
					{
						value: "jrboard",
						title: "Junior Board",
					},
					{
						value: "advisory",
						title: "Advisory Council",
					},
				],
			},
		}),
		defineField({
			name: "image",
			title: "Image",
			type: "image",
			options: {
				hotspot: true,
			},
		}),
		defineField({
			name: "bio",
			title: "Bio",
			type: "array",
			of: [
				defineArrayMember({
					title: "Block",
					type: "block",
					styles: [{ title: "Normal", value: "normal" }],
					lists: [],
				}),
			],
		}),
		defineField({
			title: "Social Media Links",
			name: "socialMediaLinks",
			type: "array",
			of: [
				defineArrayMember({
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
	],
	preview: {
		select: {
			title: "name",
			media: "image",
		},
	},
});
