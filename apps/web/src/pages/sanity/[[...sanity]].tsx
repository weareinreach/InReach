import { NextStudio, useConfigWithBasePath } from "next-sanity/studio";
import config from "../../../sanity/sanity.config";

const StudioPage = () => {
	return (
		<NextStudio
			// unstable__noGlobalStyle={true}
			config={useConfigWithBasePath(config)}
		/>
	);
};

export default StudioPage;
