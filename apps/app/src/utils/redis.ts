/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
// import { unflatten, flatten } from 'flat'
// import Redis from 'ioredis'
// import { Logger } from 'tslog'

// import { crowdinOpts } from '~app/data/crowdinOta'

// const log = new Logger({ name: 'Redis' })
// const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379'

// const generateRedisClient = () => {
// 	const client = new Redis(redisUrl, {
// 		enableAutoPipelining: true,
// 	})
// 	return client
// }
// let redis = global.redis || generateRedisClient()

// if (redis instanceof Redis) {
// 	redis.on('error', (error) => {
// 		if (error.code === 'ECONNREFUSED') {
// 			log.error('Redis server refused connection - disabling client.', error)
// 			redis!.disconnect()
// 		}
// 	})
// }

// export const redisGetCache = async (namespaces: string[], lang: string, otaManifestTimestamp: number) => {
// 	if (redis.status === 'end') {
// 		log.warn('Skipping cache read - Redis client disabled')
// 		return []
// 	}

// 	const cacheResults = new Map<string, Record<string, string | object>>()
// 	const pipeline = redis.pipeline()
// 	for (const ns of namespaces) {
// 		const cacheKey = `${ns}[${lang}]`
// 		let expired = false

// 		pipeline.expiretime(cacheKey, (err, res) =>
// 			res ? (expired = otaManifestTimestamp > res - crowdinOpts.redisTTL) : true
// 		)
// 		pipeline.hgetall(cacheKey, (err, res) => {
// 			if (!expired && res && Object.keys(res).length) cacheResults.set(ns, unflatten(res))
// 		})
// 		pipeline.expire(cacheKey, crowdinOpts.redisTTL)
// 	}
// 	await pipeline.exec()
// 	return Array.from(cacheResults.entries())
// }
// export const redisWriteCache = async (data: WriteCacheArgs[]) => {
// 	if (redis.status === 'end') {
// 		log.warn('Skipping cache write - Redis client disabled')
// 		return
// 	}
// 	if (!data.length) return
// 	const cacheKey = (ns: string, lang: string) => `${ns}[${lang}]`
// 	const pipeline = redis.pipeline()

// 	for (const item of data) {
// 		const { lang, ns, strings } = item
// 		const key = cacheKey(ns, lang)
// 		pipeline.hset(key, flatten(strings))
// 		pipeline.expire(key, crowdinOpts.redisTTL)
// 	}
// 	return await pipeline.exec()
// }

// if (process.env.NODE_ENV !== 'production') {
// 	global.redis = redis
// }
// export { redis }
// declare global {
// 	// allow global `var` declarations
// 	// eslint-disable-next-line no-var
// 	var redis: Redis | undefined
// }
// interface WriteCacheArgs {
// 	ns: string
// 	lang: string
// 	strings: Record<string, string>
// }
export {}
