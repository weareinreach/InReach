import { NextApiRequest, NextApiResponse } from 'next'
import { Logger } from 'tslog'
import { z } from 'zod'

import { crowdinOpts } from '~app/data/crowdinOta'
import { fetchCrowdinFile, fetchCrowdinDbKey, crowdinDistTimestamp } from '~app/utils/crowdin'
import { redisGetCache, redisWriteCache } from '~app/utils/redis'

const QuerySchema = z.object({
	lng: z.string(),
	ns: z.string(),
})

const log = new Logger({ name: 'i18n Loader' })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const query = QuerySchema.parse(req.query)
	const { nsFileMap } = crowdinOpts
	const namespaces = query.ns.split(' ')
	const langs = query.lng.split(' ')
	const cacheWriteQueue: WriteCacheArgs[] = []
	const databaseFile = crowdinOpts.nsFileMap.databaseStrings
	const otaManifestTimestamp = await crowdinDistTimestamp()
	const results = new Map<string, object>()
	for (const lang of langs) {
		log.info('start', lang)
		if (lang === 'en') continue
		const cached = await redisGetCache(namespaces, lang, otaManifestTimestamp)
		const langResult = new Map<string, object | string>(cached)
		await Promise.all(
			namespaces.map(async (ns) => {
				switch (true) {
					case langResult.has(ns): {
						return
					}
					case Object.hasOwn(nsFileMap, ns): {
						log.info('fetching', ns)
						const file = nsFileMap[ns as keyof typeof nsFileMap] ?? ''
						const strings = await fetchCrowdinFile(file, lang)
						if (strings) cacheWriteQueue.push({ lang, ns, strings })
						langResult.set(ns, strings)
					}
					default: {
						log.info('fetching dynamic', ns)
						const file = databaseFile
						const strings = await fetchCrowdinDbKey(ns, file, lang)
						if (strings) cacheWriteQueue.push({ lang, ns, strings })
						langResult.set(ns, strings)
					}
				}
			})
		)
		await redisWriteCache(cacheWriteQueue)
		results.set(lang, Object.fromEntries(langResult))
	}
	const data = Object.fromEntries(results.entries())
	res.status(200).json(data)
}

interface WriteCacheArgs {
	ns: string
	lang: string
	strings: Record<string, string>
}
