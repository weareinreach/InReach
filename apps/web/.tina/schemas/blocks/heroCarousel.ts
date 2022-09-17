import type { TinaTemplate } from "tinacms";
import { extractPath, formatPath, requiredField } from "../../util";

export const heroCarousel: TinaTemplate = {
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
          ui: {
            validate: (value: string) => requiredField(value),
          },
        },
        {
          name: "alt",
          label: "Image Description",
          type: "string",
          ui: {
            validate: (value: string) => requiredField(value),
          },
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
                  ui: {
                    validate: (value) => requiredField(value),
                  },
                },
                {
                  name: "href",
                  label: "URL",
                  type: "reference",
                  collections: ["pages"],
                  ui: {
                    parse: (val) => val && extractPath(val.toString()),
                    format: (val) => (val ? formatPath(val.toString()) : ""),
                    validate: (value) => requiredField(value),
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
