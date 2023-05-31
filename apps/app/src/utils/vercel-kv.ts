import { kv as redis } from '@vercel/kv'
import { flatten, unflatten } from 'flat'
import { Logger } from 'tslog'

const redisTTL = 86400
const log = new Logger({ name: 'Vercel KV' })

export const redisReadCache = async (namespaces: string[], lang: string, otaManifestTimestamp: number) => {
	if ((await redis.ping()) !== 'PONG') {
		log.warn('Skipping cache read - Redis client not connected')
		return []
	}

	const cacheResults = new Map<string, Record<string, string | object>>()

	for (const ns of namespaces) {
		const cacheKey = `${ns}[${lang}]`
		const expiretime = (await redis.ttl(cacheKey)) + Math.round(Date.now() / 1000)

		if (otaManifestTimestamp > expiretime - redisTTL) {
			log.info(`Manifest is newer than cache - skipping cache for ${cacheKey}`)
			continue
		}

		const cached = await redis.hgetall(cacheKey)
		await redis.expire(cacheKey, redisTTL)
		if (cached) {
			cacheResults.set(ns, unflatten(cached))
			log.info(`Cache hit: ${cacheKey}. Items: ${Object.keys(cached).length}`)
		}
	}
	log.info(`Cache return: ${cacheResults.size}`)
	return Array.from(cacheResults.entries())
}
export const redisWriteCache = async (data: WriteCacheArgs[]) => {
	if ((await redis.ping()) !== 'PONG') {
		log.warn('Skipping cache write - Redis client not connected')
		return
	}
	if (!data.length) return
	const cacheKey = (ns: string, lang: string) => `${ns}[${lang}]`
	const pipeline = redis.pipeline()

	for (const item of data) {
		const { lang, ns, strings } = item
		const key = cacheKey(ns, lang)
		if (!strings) {
			log.info(`No strings to write for ${key} - skipping`)
			continue
		}
		const flattenedStrings = flatten<Record<string, string | object>, Record<string, string>>(strings)

		log.info(`Writing ${key} - ${Object.keys(flattenedStrings).length} strings`)
		pipeline.hset(key, flattenedStrings)
		pipeline.expire(key, redisTTL)
	}
	const cacheResult = await pipeline.exec<number[]>()

	const writtenTotal = cacheResult.reduce((acc, item, i) => {
		if (typeof item === 'number' && i % 2 === 0) {
			return acc + item
		}
		return acc
	}, 0)

	log.info(`Total written to cache: ${writtenTotal}`)
	return cacheResult
}
interface WriteCacheArgs {
	ns: string
	lang: string
	strings: Record<string, string | object>
}
