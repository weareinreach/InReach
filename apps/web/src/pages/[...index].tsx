import * as Sentry from "@sentry/nextjs";

import {
	GetStaticPaths,
	GetStaticPathsResult,
	GetStaticProps,
	InferGetStaticPropsType,
} from "next";
import { Blocks } from "@inreach/ui/components/web";
import { WebLayout } from "@inreach/ui/layouts";
import navData from "../../data/nav.json";
import type { NextPageWithLayout } from "./_app";
import type { ReactElement } from "react";

const PageTemplate: NextPageWithLayout = () =>
	// props: InferGetStaticPropsType<typeof getStaticProps>
	{
		return (
			<>
				<Blocks />
			</>
		);
	};

PageTemplate.getLayout = (page: ReactElement) => {
	return <WebLayout navData={navData}>{page}</WebLayout>;
};

// export const getStaticProps: GetStaticProps = async ({ params }) => {
// 	console.log("gsp params", params);
// 	let data = {};
// 	let query = {};

// 	if (!params?.pagepath) throw new Error("No page path passed");

// 	const pagePath =
// 		typeof params.pagepath === "string"
// 			? `${params.pagepath}.mdx`
// 			: `${params.pagepath.join("/")}.mdx`;
// 	let variables = { relativePath: pagePath };
// 	// console.log("relativePath", variables.relativePath);
// 	try {
// 		const res = await client.queries.pages(variables);
// 		query = res.query;
// 		data = res.data;
// 		variables = res.variables;
// 	} catch (err) {
// 		console.error(err);
// 		Sentry.captureException(err);
// 	}
// 	const props = {
// 		variables: variables,
// 		data: data,
// 		query: query,
// 	};
// 	console.log(props);
// 	return {
// 		props,
// 	};
// };

// export const getStaticPaths: GetStaticPaths = async () => {
// 	const pagesListData = await client.queries.pagesConnection();

// 	const { edges } = pagesListData.data.pagesConnection;
// 	const pages = edges?.map((item) => {
// 		if (item?.node)
// 			return {
// 				params: {
// 					pagepath: item.node._sys.breadcrumbs,
// 				},
// 			};
// 	});

// 	const results = {
// 		paths: pages,
// 		fallback: false,
// 	} as GetStaticPathsResult;
// 	return results;
// };

export default PageTemplate;
