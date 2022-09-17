import type { TinaTemplate } from "tinacms";

export const newsSection: TinaTemplate = {
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
};
