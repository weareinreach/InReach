import { useTina } from "tinacms/dist/edit-state";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import client from "../../.tina/__generated__/client";
import * as Sentry from "@sentry/nextjs";

import { HeroCarousel, LinkButton } from "@inreach/ui/components/web";
import { GetStaticPaths, GetStaticProps } from "next";

const cmsComponents = {
  HeroCarousel: HeroCarousel,
  LinkButton: LinkButton,
};

const PageTemplate = (props) => {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });
  console.log(data);

  return (
    <>
      <TinaMarkdown components={cmsComponents} content={data.post.body} />
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // console.log(params);
  let data = {};
  let query = {};
  let variables = { relativePath: `${params.page}.mdx` };
  console.log("getStaticProps");
  try {
    const res = await client.queries.pages(variables);
    query = res.query;
    data = res.data;
    variables = res.variables;
  } catch (err) {
    console.error(err);
    Sentry.captureException(err);
  }
  const props = {
    variables: variables,
    data: data,
    query: query,
  };
  console.log(props);
  return {
    props,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const pagesListData = await client.queries.pagesConnection();
  console.log("getStaticPaths");

  const { edges } = pagesListData.data.pagesConnection;
  const pages = edges?.map((item) => {
    if (item?.node)
      return {
        params: {
          pagepath: item.node._sys.breadcrumbs,
        },
      };
  });

  if (!pages) return;

  const results = {
    paths: pages,
    fallback: false,
  };

  console.log(results.paths);
  return results;
};

export default PageTemplate;
