import { createClient } from 'next-sanity'

export const sanityClient = createClient({
	projectId: 'dwv4rfh3',
	dataset: process.env.NODE_ENV === 'production' ? 'production' : 'staging',
	apiVersion: '2022-09-20',
	useCdn: false,
})
