import type { TinaTemplate } from "tinacms";

export const awardsSection: TinaTemplate = {
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
};
