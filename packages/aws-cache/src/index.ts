/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
import { APIGatewayProxyHandlerV2WithIAMAuthorizer } from 'aws-lambda'
import { unflatten, flatten } from 'flat'
import Redis from 'ioredis'
import { Logger } from 'tslog'
import { z } from 'zod'

const redisTTL = 86400

const log = new Logger({ name: 'Redis' })
const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379'

const generateRedisClient = () => {
	const client = new Redis(redisUrl, {
		enableAutoPipelining: true,
	})
	return client
}
// eslint-disable-next-line prefer-const
const redis = generateRedisClient()

if (redis instanceof Redis) {
	redis.on('error', (error) => {
		if (error.code === 'ECONNREFUSED') {
			log.error('Redis server refused connection - disabling client.', error)
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			redis!.disconnect()
		}
	})
}

const redisGetCache = async (namespaces: string[], lang: string, otaManifestTimestamp: number) => {
	if (redis.status === 'end') {
		log.warn('Skipping cache read - Redis client disabled')
		return []
	}

	const cacheResults = new Map<string, Record<string, string | object>>()
	const pipeline = redis.pipeline()
	for (const ns of namespaces) {
		const cacheKey = `${ns}[${lang}]`
		let expired = false

		pipeline.expiretime(cacheKey, (err, res) =>
			res ? (expired = otaManifestTimestamp > res - redisTTL) : true
		)
		pipeline.hgetall(cacheKey, (err, res) => {
			if (!expired && res && Object.keys(res).length) cacheResults.set(ns, unflatten(res))
		})
		pipeline.expire(cacheKey, redisTTL)
	}
	await pipeline.exec()
	log.info(`Cache return: ${cacheResults.size}`)
	return Array.from(cacheResults.entries())
}
const redisWriteCache = async (data: WriteCacheArgs[]) => {
	if (redis.status === 'end') {
		log.warn('Skipping cache write - Redis client disabled')
		return
	}
	if (!data.length) return
	const cacheKey = (ns: string, lang: string) => `${ns}[${lang}]`
	const pipeline = redis.pipeline()

	for (const item of data) {
		const { lang, ns, strings } = item
		const key = cacheKey(ns, lang)
		pipeline.hset(key, flatten(strings))
		pipeline.expire(key, redisTTL)
	}
	return await pipeline.exec()
}

const GetCacheSchema = z.object({
	namespaces: z.string().array(),
	lang: z.string(),
	otaManifestTimestamp: z.number(),
})

export const readHandler: APIGatewayProxyHandlerV2WithIAMAuthorizer = async (event) => {
	try {
		const parsedBody = GetCacheSchema.parse(JSON.parse(event.body ?? ''))
		const { namespaces, lang, otaManifestTimestamp } = parsedBody

		const result = await redisGetCache(namespaces, lang, otaManifestTimestamp)

		return {
			statusCode: 200,
			body: JSON.stringify(result),
		}
	} catch (err) {
		console.error(err)
		return {
			statusCode: 500,
			body: JSON.stringify(err),
		}
	}
}

type Strings = Record<string, string | object>

const StringRecord: z.ZodType<Strings> = z.lazy(() => z.record(z.string().or(StringRecord)))

const WriteCacheSchema = z
	.object({
		ns: z.string(),
		lang: z.string(),
		strings: StringRecord,
	})
	.array()

export const writeHandler: APIGatewayProxyHandlerV2WithIAMAuthorizer = async (event) => {
	try {
		const data = WriteCacheSchema.parse(JSON.parse(event.body ?? ''))
		const result = await redisWriteCache(data)
		return {
			statusCode: 200,
			body: JSON.stringify(result),
		}
	} catch (error) {
		console.error(error)
		return {
			statusCode: 500,
			body: JSON.stringify(error),
		}
	}
}

interface WriteCacheArgs {
	ns: string
	lang: string
	strings: Record<string, string | object>
}
