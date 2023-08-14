import { context, trace } from '@opentelemetry/api'
import { kv as redis } from '@vercel/kv'
import { flatten, unflatten } from 'flat'
import sizeof from 'object-sizeof'
import formatBytes from 'pretty-bytes'

import { createLoggerInstance } from '@weareinreach/util/logger'

const redisTTL = 86400
const log = createLoggerInstance('Vercel KV')
const tracer = trace.getTracer('inreach-app')

export const redisReadCache = async (namespaces: string[], lang: string, otaManifestTimestamp: number) => {
	const span = tracer.startSpan('redisReadCache', undefined, context.active())
	try {
		if ((await redis.ping()) !== 'PONG') {
			log.warn('Skipping cache read - Redis client not connected')
			return []
		}

		const cacheResults = new Map<string, Record<string, string | object>>()
		const expireQueue: string[] = []

		for (const ns of namespaces) {
			const cacheKey = `${ns}[${lang}]`
			const itemTTL = await redis.ttl(cacheKey)

			if (itemTTL <= 0) {
				log.info(`Cache not found: ${cacheKey}`)
				continue
			}
			const expiretime = itemTTL + Math.round(Date.now() / 1000)

			if (otaManifestTimestamp > expiretime - redisTTL) {
				log.info(`Manifest is newer than cache - skipping cache for ${cacheKey}`)
				continue
			}
			// Retrieve cache
			const spanHgetall = tracer.startSpan('redis-hgetall', undefined, context.active())
			spanHgetall.setAttribute('cacheKey', cacheKey)
			const cached = await redis.hgetall(cacheKey)
			spanHgetall.addEvent('retrieved size', { size: formatBytes(sizeof(cached)) })
			spanHgetall.end()

			// add expiration extension to queue
			expireQueue.push(cacheKey)

			if (cached) {
				cacheResults.set(ns, unflatten(cached))
				log.info(`Cache hit: ${cacheKey}. Items: ${Object.keys(cached).length}`)
			}
		}

		if (expireQueue.length) {
			// Extend expire time
			const expirePipeline = redis.pipeline()
			const spanExpire = tracer.startSpan('redis-expire', undefined, context.active())
			for (const item of expireQueue) {
				expirePipeline.expire(item, redisTTL)
			}
			await expirePipeline.exec()
			spanExpire.end()
		}
		const cacheArray = Array.from(cacheResults.entries())

		log.info(`Cache return: ${cacheResults.size} ${formatBytes(sizeof(cacheArray))}`)
		span.addEvent('data return size', { size: formatBytes(sizeof(cacheArray)) })
		return cacheArray
	} finally {
		span.end()
	}
}
export const redisWriteCache = async (data: WriteCacheArgs[]) => {
	const span = tracer.startSpan('redisWriteCache', undefined, context.active())
	try {
		if ((await redis.ping()) !== 'PONG') {
			log.warn('Skipping cache write - Redis client not connected')
			return
		}
		if (!data.length) return
		const cacheKey = (ns: string, lang: string) => `${ns}[${lang}]`
		const pipeline = redis.pipeline()
		let dataSize = 0

		for (const item of data) {
			const loopSpan = tracer.startSpan('Prepare cache to write')
			loopSpan.setAttributes({
				cacheKey: cacheKey(item.ns, item.lang),
				strings: Object.keys(item.strings).length,
			})
			const { lang, ns, strings } = item
			const key = cacheKey(ns, lang)
			if (!strings) {
				log.info(`No strings to write for ${key} - skipping`)
				continue
			}
			const flattenedStrings = flatten<Record<string, string | object>, Record<string, string>>(strings)

			log.info(`Writing ${key} - ${Object.keys(flattenedStrings).length} strings`)
			dataSize += sizeof(flattenedStrings)
			pipeline.hset(key, flattenedStrings)
			pipeline.expire(key, redisTTL)
			loopSpan.end()
		}

		const writeSpan = tracer.startSpan('Write cache')
		writeSpan.setAttributes({
			size: formatBytes(dataSize),
		})

		const cacheResult = await pipeline.exec<number[]>()

		const writtenTotal = cacheResult.reduce((acc, item, i) => {
			if (typeof item === 'number' && i % 2 === 0) {
				return acc + item
			}
			return acc
		}, 0)

		writeSpan.setAttribute('stringsWritten', writtenTotal)
		writeSpan.end()

		log.info(`Total written to cache: ${writtenTotal}`)
		return writtenTotal
	} finally {
		span.end()
	}
}
interface WriteCacheArgs {
	ns: string
	lang: string
	strings: Record<string, string | object>
}
