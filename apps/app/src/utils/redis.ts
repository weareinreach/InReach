/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
import { unflatten, flatten } from 'flat'
import Redis from 'ioredis'
import { Logger } from 'tslog'

import { crowdinOpts } from '~app/data/crowdinOta'

const log = new Logger({ name: 'redis' })
const redisUrl = process.env.REDIS_URL as string
export const redis =
	global.redis ||
	new Redis(redisUrl, {
		enableAutoPipelining: true,
	})
export const redisGetCache = async (namespaces: string[], lang: string, otaManifestTimestamp: number) => {
	const cacheResults = new Map<string, Record<string, string | object>>()
	const pipeline = redis.pipeline()
	for (const ns of namespaces) {
		const cacheKey = `${ns}[${lang}]`
		let expired = false

		pipeline.expiretime(cacheKey, (err, res) =>
			res ? (expired = otaManifestTimestamp > res - crowdinOpts.redisTTL) : true
		)
		pipeline.hgetall(cacheKey, (err, res) => {
			if (!expired && res && Object.keys(res).length) cacheResults.set(ns, unflatten(res))
		})
		pipeline.expire(cacheKey, crowdinOpts.redisTTL)

		// const cacheCreated = (await redis.expiretime(cacheKey)) - crowdinOpts.redisTTL
		// log.info('dist ts', otaManifestTimestamp, 'cache ts', cacheCreated, 'diff', otaManifestTimestamp - cacheCreated)

		// log.info('dist newer?', otaManifestTimestamp > cacheCreated)
		// if (otaManifestTimestamp > cacheCreated) return undefined
		// const cacheData = pipeline.hgetall(cacheKey)
		// pipeline.expire(cacheKey, crowdinOpts.redisTTL)
	}
	await pipeline.exec()
	return Array.from(cacheResults.entries())
}
export const redisWriteCache = async (data: WriteCacheArgs[]) => {
	if (!data.length) return
	const cacheKey = (ns: string, lang: string) => `${ns}[${lang}]`
	const pipeline = redis.pipeline()

	for (const item of data) {
		const { lang, ns, strings } = item
		const key = cacheKey(ns, lang)
		pipeline.hset(key, flatten(strings))
		pipeline.expire(key, crowdinOpts.redisTTL)
	}
	return await pipeline.exec()
}

if (process.env.NODE_ENV !== 'production') {
	global.redis = redis
}
declare global {
	// allow global `var` declarations
	// eslint-disable-next-line no-var
	var redis: Redis | undefined
}
interface WriteCacheArgs {
	ns: string
	lang: string
	strings: Record<string, string>
}
