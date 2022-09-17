import type { TinaTemplate } from "tinacms";

export const issuesSection: TinaTemplate = {
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
};
