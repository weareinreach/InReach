import { defineSchema, defineConfig, wrapFieldsWithMeta } from "tinacms";
import { object } from "zod";
import { client } from "./__generated__/client";
import { navbar, pageCollection } from "./schemas";
import { env } from "../src/env/server.mjs";

const branch =
  process.env.NEXT_PUBLIC_TINA_BRANCH ||
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";
const schema = defineSchema({
  // See https://tina.io/docs/tina-cloud/connecting-site/ for more information about this config
  config: {
    token: process.env.TINA_TOKEN, // generated on app.tina.io,
    clientId: process.env.TINA_CLIENTID, // generated on app.tina.io
    branch,
    media: {
      tina: {
        publicFolder: "public",
        mediaRoot: "uploads",
      },
    },
  },
  collections: [
    navbar,
    pageCollection,
    {
      label: "Blog Posts",
      name: "post",
      path: "content/posts",
      format: "mdx",
      ui: {
        router: ({ document }) => {
          // This can be used to add contextual editing to your site. See https://tina.io/docs/tinacms-context/#accessing-contextual-editing-from-the-cms for more information.
          return `/demo/blog/${document._sys.filename}`;
        },
      },
      fields: [
        {
          type: "string",
          label: "Title",
          name: "title",
        },
        {
          type: "rich-text",
          label: "Blog Post Body",
          name: "body",
          isBody: true,
          templates: [
            {
              name: "PageSection",
              label: "Page Section",
              fields: [
                {
                  type: "string",
                  name: "heading",
                  label: "Heading",
                },
                {
                  type: "string",
                  name: "content",
                  label: "Content",
                  ui: {
                    component: "textarea",
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
});

export default schema;

// Your tina config

export const tinaConfig = defineConfig({
  client,
  schema,
});
