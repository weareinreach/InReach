// lib/sanity.server.js
import { createClient } from 'next-sanity'

import { env } from '../src/env/server.mjs'
import { config } from './sanityConfig'

/* Creating a client that is used to fetch data from the Sanity API. */
export const sanityClient = createClient(config)

/* Creating a preview client that is used to fetch data from the Sanity API. */
export const previewClient = createClient({
	...config,
	useCdn: false,
	token: env.SANITY_TOKEN,
})

/**
 * It returns the previewClient if usePreview is true, otherwise it returns the sanityClient
 *
 * @param [usePreview=false] - A boolean that determines whether to use the preview client or the regular
 *   client. Default is `false`
 */
export const getClient = (usePreview = false) => (usePreview ? previewClient : sanityClient)
