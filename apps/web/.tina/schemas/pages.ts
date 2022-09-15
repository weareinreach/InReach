import type { TinaCollection } from "tinacms";
import { extractPath, formatPath } from "../util";
import type React from "react";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import superjson from "superjson";

export const pageCollection: TinaCollection = {
  label: "Pages",
  name: "pages",
  path: "content/pages",
  format: "mdx",
  //   ui: {
  //     router: ({ document }) => {
  //       return `/${document._sys.filename}`;
  //     },
  //   },
  templates: [
    {
      name: "main",
      label: "Main Page",
      fields: [
        {
          label: "Page Title",
          name: "title",
          type: "string",
        },
        {
          label: "SEO",
          name: "meta",
          type: "object",
          fields: [
            {
              label: "Description",
              name: "description",
              type: "string",
            },
            {
              label: "Card Image",
              name: "image",
              type: "image",
            },
          ],
        },
        {
          type: "object",
          list: true,
          label: "Sections",
          name: "blocks",
          templates: [
            {
              name: "HeroCarousel",
              label: "Hero Carousel",
              fields: [
                {
                  name: "HeroCarouselSlide",
                  label: "Content",
                  type: "object",
                  list: true,
                  fields: [
                    {
                      name: "image",
                      label: "Background Image",
                      type: "image",
                    },
                    {
                      name: "alt",
                      label: "Image Description",
                      type: "string",
                    },
                    {
                      name: "content",
                      label: "Text Content",
                      type: "rich-text",
                      templates: [
                        {
                          name: "LinkButton",
                          label: "Action button",
                          fields: [
                            {
                              name: "text",
                              label: "Display text",
                              type: "string",
                            },
                            {
                              name: "href",
                              label: "URL",
                              type: "reference",
                              collections: ["pages"],
                              ui: {
                                parse: (val) =>
                                  val && extractPath(val.toString()),
                                format: (val) =>
                                  val ? formatPath(val.toString()) : "",
                              },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "IssuesSection",
              label: "Issues section",
              fields: [
                {
                  name: "headerText",
                  label: "Heading",
                  type: "string",
                },
                {
                  name: "image",
                  label: "Background image",
                  type: "image",
                },
                {
                  name: "issues",
                  label: "Issues",
                  type: "object",
                  list: true,
                  fields: [
                    {
                      name: "statFigure",
                      label: "Stat Figure",
                      type: "string",
                    },
                    {
                      name: "statText",
                      label: "Stat Text",
                      type: "string",
                    },
                  ],
                },
              ],
            },
            {
              name: "NewsSection",
              label: "In the News",
              fields: [
                {
                  name: "items",
                  label: "Featured",
                  type: "object",
                  list: true,
                  ui: {
                    itemProps: (item) => {
                      return { label: item?.alt };
                    },
                  },
                  fields: [
                    {
                      name: "image",
                      label: "Image",
                      type: "image",
                    },
                    {
                      name: "alt",
                      label: "News Outlet Name",
                      type: "string",
                    },
                  ],
                },
              ],
            },
            {
              name: "AwardsSection",
              label: "Awards",
              fields: [
                {
                  name: "items",
                  label: "Awards",
                  type: "object",
                  list: true,
                  ui: {
                    itemProps: (item) => {
                      return { label: item?.text };
                    },
                  },
                  fields: [
                    {
                      name: "image",
                      label: "Image",
                      type: "image",
                    },
                    {
                      name: "alt",
                      label: "Image Description",
                      type: "string",
                    },
                    {
                      name: "text",
                      label: "Card text",
                      type: "string",
                    },
                  ],
                },
              ],
            },
            {
              name: "LinkButton",
              label: "Action button",
              fields: [
                {
                  name: "text",
                  label: "Display text",
                  type: "string",
                },
                {
                  name: "href",
                  label: "URL",
                  type: "string",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "aboutUsMission",
      label: "About Us | Mission",
      fields: [
        {
          label: "Page Title",
          name: "title",
          type: "string",
        },
        {
          label: "SEO",
          name: "meta",
          type: "object",
          fields: [
            {
              label: "Description",
              name: "description",
              type: "string",
            },
            {
              label: "Card Image",
              name: "image",
              type: "image",
            },
          ],
        },
        {
          type: "rich-text",
          label: "Page body",
          name: "body",
          isBody: true,
        },
      ],
    },
  ],
};
