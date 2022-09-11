import { SocialMediaIconSelect } from "../components/SocialMediaIconSelect";
import type { TinaCollection } from "tinacms";
export const navbar: TinaCollection = {
  label: "Navbar Data",
  name: "navbarData",
  path: "data",
  format: "json",
  fields: [
    {
      label: "Social Media Links",
      name: "socialMediaLinks",
      type: "object",
      list: true,
      ui: {
        itemProps: (item) => {
          return { label: item?.service };
        },
      },
      fields: [
        {
          label: "Service Name",
          name: "service",
          type: "string",
        },
        {
          label: "URL",
          name: "url",
          type: "string",
        },
        {
          label: "Icon",
          name: "icon",
          description: "Social media Icon",
          type: "string",
          ui: {
            component: SocialMediaIconSelect,
          },
        },
      ],
    },
    {
      label: "Navigation Links",
      name: "navLinks",
      type: "object",
      list: true,
      ui: {
        itemProps: (item) => {
          return { label: item?.label };
        },
      },
      fields: [
        {
          label: "Top Level Item",
          name: "label",
          type: "string",
        },
        {
          label: "URL",
          name: "link",
          type: "string",
        },
        {
          label: "Subitems",
          name: "links",
          type: "object",
          list: true,
          ui: {
            itemProps: (item) => {
              return { label: item?.label };
            },
          },
          fields: [
            {
              label: "Menu Item",
              name: "label",
              type: "string",
            },
            {
              label: "URL",
              name: "link",
              type: "string",
            },
          ],
        },
      ],
    },
  ],
};
