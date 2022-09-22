import { NextStudio, useConfigWithBasePath } from "next-sanity/studio";
import config from "../../../sanity/sanity.config";

const StudioPage = () => {
	return <NextStudio config={useConfigWithBasePath(config)} />;
};

export default StudioPage;
