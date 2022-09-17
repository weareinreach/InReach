import type { TinaCollection } from "tinacms";
import {
  awardsSection,
  heroCarousel,
  issuesSection,
  newsSection,
} from "./blocks";
import { extractPath, formatPath } from "../util";

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
      templates: [heroCarousel, awardsSection, issuesSection, newsSection],
    },
  ],
};
