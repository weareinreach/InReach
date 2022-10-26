import { NextStudio, useConfigWithBasePath } from "next-sanity/studio";
import config from "../../../sanity/sanity.config";
import type { GetServerSideProps } from "next";

const StudioPage = () => {
	// return <NextStudio config={useConfigWithBasePath(config)} />;
	return <NextStudio config={config} />;
};

export default StudioPage;
