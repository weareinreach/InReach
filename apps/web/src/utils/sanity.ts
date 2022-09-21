import { setupNextSanity } from "next-sanity-extra";
import { env as clientEnv } from "../env/client.mjs";
import { env as serverEnv } from "../env/server.mjs";

// https://www.sanity.io/plugins/next-sanity-extra

// Standard sanity config
// Don't forget token, to get a preview client and authenticated client
const config = {
	projectId: clientEnv.NEXT_PUBLIC_SANITY_PROJECT_ID,
	dataset: clientEnv.NEXT_PUBLIC_SANITY_DATASET,
	useCdn: serverEnv.NODE_ENV === "production",
	token: serverEnv.SANITY_API_TOKEN,
};

export const {
	sanityClient,
	imageUrlBuilder,
	PortableText,
	sanityStaticProps,
	useSanityQuery,
} = setupNextSanity(config);
