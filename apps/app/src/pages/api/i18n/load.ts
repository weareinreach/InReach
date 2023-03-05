import OtaClient from '@crowdin/ota-client'
import { NextApiRequest, NextApiResponse } from 'next'
import { Logger } from 'tslog'
import { z } from 'zod'

import { crowdinOpts } from '~app/data/crowdinOta'
import { fetchCrowdinFile, fetchCrowdinKey, crowdinDistTimestamp } from '~app/utils/crowdin'
import { redisGetCache, redisWriteCache } from '~app/utils/redis'

const QuerySchema = z.object({
	lng: z.string(),
	ns: z.string(),
})

const log = new Logger({ name: 'load api' })
const otaClient = new OtaClient(crowdinOpts.hash)

// const redisGetCache = async (redisKey: string, lang: string) => {
// 	const cacheKey = `${redisKey}[${lang}]`

// 	const keyExists = await redis.exists(cacheKey)
// 	log.info('cache key exists', keyExists)
// 	if (!keyExists) return undefined

// 	const crowdinDistAge = await otaClient.getManifestTimestamp()
// 	const cacheCreated = (await redis.expiretime(cacheKey)) - crowdinOpts.redisTTL
// 	log.info('dist ts', crowdinDistAge, 'cache ts', cacheCreated, 'diff', crowdinDistAge - cacheCreated)

// 	log.info('dist newer?', crowdinDistAge > cacheCreated)
// 	if (crowdinDistAge > cacheCreated) return undefined
// 	const pipeline = redis.pipeline()
// 	const cacheData = pipeline.hgetall(cacheKey)
// 	pipeline.expire(cacheKey, crowdinOpts.redisTTL)

// 	const piperesult = await pipeline.exec()
// 	return cacheData
// }
// const redisWriteCache = async (data: WriteCacheArgs[]) => {
// 	if (!data.length) return
// 	const cacheKey = (ns: string, lang: string) => `${ns}[${lang}]`
// 	const pipeline = redis.pipeline()

// 	for (const item of data) {
// 		const { lang, ns, strings } = item
// 		const key = cacheKey(ns, lang)
// 		pipeline.hset(key, strings)
// 		pipeline.expire(key, crowdinOpts.redisTTL)
// 	}
// 	return await pipeline.exec()
// }

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
		if (lang === 'en') continue
		const cached = await redisGetCache(namespaces, lang, otaManifestTimestamp)
		const langResult = new Map<string, object | string>(cached)
		console.log(langResult)
		await Promise.all(
			namespaces.map(async (ns) => {
				switch (true) {
					case langResult.has(ns): {
						log.info('cache hit', ns)
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
						const strings = await fetchCrowdinKey(ns, file, lang)
						log.info(strings)
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
	log.info(data)
	res.status(200).json(data)
}

interface WriteCacheArgs {
	ns: string
	lang: string
	strings: Record<string, string>
}
