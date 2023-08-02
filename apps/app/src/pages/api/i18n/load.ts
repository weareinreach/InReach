/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
import { context, trace } from '@opentelemetry/api'
import { type NextApiRequest, type NextApiResponse } from 'next'
import { z } from 'zod'

import { createSubLog } from '@weareinreach/util/logger'
import { crowdinOpts } from '~app/data/crowdinOta'
import { crowdinDistTimestamp, fetchCrowdinDbKey, fetchCrowdinFile } from '~app/utils/crowdin'
import { redisReadCache, redisWriteCache } from '~app/utils/vercel-kv'

const QuerySchema = z.object({
	lng: z.string(),
	ns: z.string(),
})
const tracer = trace.getTracer('inreach-app')
const log = createSubLog('i18n Loader')

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const query = QuerySchema.parse(req.query)
	const namespaces = query.ns.split(' ')
	const langs = query.lng.split(' ')
	const cacheWriteQueue: WriteCacheArgs[] = []
	const otaManifestTimestamp = await crowdinDistTimestamp()
	const results = new Map<string, object>()

	for (const lang of langs) {
		try {
			const nsFileMap = crowdinOpts.nsFileMap(lang)
			if (lang === 'en') continue
			const databaseFile = crowdinOpts.nsFileMap(lang).databaseStrings
			const cached = await redisReadCache(namespaces, lang, otaManifestTimestamp)
			const langResult = new Map<string, object | string>(cached)

			const fetchCrowdin = async (ns: string) => {
				const crowdinSpan = tracer.startSpan('Crowdin OTA', undefined, context.active())
				try {
					crowdinSpan.setAttributes({ ns })
					switch (true) {
						case langResult.has(ns): {
							return
						}
						case Object.hasOwn(nsFileMap, ns): {
							const file = nsFileMap[ns as keyof typeof nsFileMap] ?? ''
							const strings = await fetchCrowdinFile(file, lang)
							if (strings && Object.keys(strings).length) cacheWriteQueue.push({ lang, ns, strings })
							langResult.set(ns, strings)
							break
						}
						default: {
							const file = databaseFile
							const strings = await fetchCrowdinDbKey(ns, file, lang)
							if (strings) cacheWriteQueue.push({ lang, ns, strings })
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
			return res.status(500).json({ error })
		}
	}
	const data = Object.fromEntries(results.entries())
	res.status(200).json(data)
}

interface WriteCacheArgs {
	ns: string
	lang: string
	strings: Record<string, string | object>
}
