import { createClient } from "next-sanity";

export const sanityClient = createClient({
	projectId: "InReach",
	dataset: "production",
	useCdn: false,
	apiVersion: "2022-09-19",
});
