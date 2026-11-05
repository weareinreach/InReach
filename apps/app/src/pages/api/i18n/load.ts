import { context, trace } from '@opentelemetry/api'
// import { type NextApiRequest, type NextApiResponse } from 'next'
import { type NextRequest } from 'next/server'
import { z } from 'zod'

import { redisReadCache, redisWriteCache } from '@weareinreach/crowdin/cache'
import {
	crowdinDistTimestamp,
	fetchCrowdinDbKey,
	fetchCrowdinFile,
	sourceFiles,
} from '@weareinreach/crowdin/ota/edge'
import { createLoggerInstance } from '@weareinreach/util/logger'

export const config = {
	runtime: 'edge',
}

// Unauthenticated by design (translations are public content), but previously had no cap on how many
// space-separated values either list could contain - a single request could fan out to `langs.length *
// namespaces.length` separate upstream Crowdin calls and arbitrary Redis cache-key writes. These caps are
// generous relative to real usage (a page loads a handful of namespaces for one locale at a time) while
// ruling out that kind of amplification.
const QuerySchema = z.object({
	lng: z
		.string()
		.transform((s) => s.split(' '))
		.pipe(z.array(z.string()).max(5)),
	ns: z
		.string()
		.transform((s) => s.split(' '))
		.pipe(z.array(z.string()).max(30)),
})
const tracer = trace.getTracer('inreach-app')
const log = createLoggerInstance('i18n Loader')

export default async function handler(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url)
		const parsedQuery = QuerySchema.safeParse({ ns: searchParams.get('ns'), lng: searchParams.get('lng') })

		if (!parsedQuery.success) {
			return new Response(JSON.stringify({ error: parsedQuery.error.message }), {
				status: 400,
			})
		}
		const query = parsedQuery.data
		const { ns: namespaces, lng: langs } = query
		const cacheWriteQueue: WriteCacheArgs[] = []
		const otaManifestTimestamps = await crowdinDistTimestamp()
		const results = new Map<string, object>()

		for (const lang of langs) {
			try {
				const nsFileMap = sourceFiles(lang)
				if (lang === 'en') {
					continue
				}
				const cached = await redisReadCache(namespaces, lang, otaManifestTimestamps)
				const langResult = new Map<string, object | string>(cached)

				const fetchCrowdin = async (ns: string) => {
					const crowdinSpan = tracer.startSpan('Crowdin OTA', undefined, context.active())
					try {
						crowdinSpan.setAttributes({ ns })
						switch (true) {
							// Check if the namespace is already in the cache
							case langResult.has(ns): {
								return
							}
							// Check if the namespace is file based
							case ns in nsFileMap: {
								const file = nsFileMap[ns as keyof typeof nsFileMap] ?? ''
								const strings = await fetchCrowdinFile(file, lang)
								if (strings && Object.keys(strings).length) {
									cacheWriteQueue.push({ lang, ns, strings })
								}
								langResult.set(ns, strings)
								break
							}
							// Otherwise, it must be a database key
							default: {
								const strings = await fetchCrowdinDbKey(ns, lang)
								if (strings) {
									cacheWriteQueue.push({ lang, ns, strings })
								}
								langResult.set(ns, strings)
							}
						}
					} finally {
						crowdinSpan.end()
					}
				}

				await Promise.all(namespaces.map((ns) => fetchCrowdin(ns)))

				await redisWriteCache(cacheWriteQueue)

				results.set(lang, Object.fromEntries(langResult))
			} catch (error) {
				log.error(error)
				return new Response(JSON.stringify({ error: 'Internal server error' }), {
					status: 500,
				})
			}
		}
		const data = Object.fromEntries(results.entries())
		// res.status(200).json(data)
		return new Response(JSON.stringify(data), {
			status: 200,
			headers: {
				'Cache-Control': 's-maxage=1, public, stale-while-revalidate=3600',
			},
		})
	} catch (error) {
		log.error(error)
		return new Response(JSON.stringify({ error: 'Internal server error' }), {
			status: 500,
		})
	}
}

interface WriteCacheArgs {
	ns: string
	lang: string
	strings: Record<string, string | object>
}
