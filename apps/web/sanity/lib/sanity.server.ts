// lib/sanity.server.js
import { createClient } from "next-sanity";
import { config } from "./config";
import { env } from "../../src/env/server.mjs";

// Set up the client for fetching data in the getProps page functions
export const sanityClient = createClient(config);

// Set up a preview client with serverless authentication for drafts
export const previewClient = createClient({
	...config,
	useCdn: false,
	token: env.SANITY_TOKEN,
});

// Helper function for easily switching between normal client and preview client
export const getClient = (usePreview = false) =>
	usePreview ? previewClient : sanityClient;
