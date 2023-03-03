/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
import { TranslationMap } from '@weareinreach/i18next-keys-ondemand'
import { unflatten, flatten } from 'flat'
import Redis from 'ioredis'

import namespaces from '~app/data/namespaces'

export const redis = new Redis(process.env.REDIS_URL as string, {
	enableAutoPipelining: true,
})

/**
 * It gets a translation from Redis
 *
 * @param key - The key to get from the cache. **For `org-data`, pass in the TOP LEVEL key only!**
 * @param ns - The namespace of the translation.
 * @param lang - The language code to get the translation for.
 * @returns A promise that resolves to a string.
 */
export const redisGetTrans = async (key: string, ns: (typeof namespaces)[number], lang: string) => {
	switch (ns) {
		case 'org-data': {
			const hKey = `${ns}:${key}:${lang}`
			const cacheResult = await redis.hgetall(hKey)
			if (!Object.keys(cacheResult).length) return undefined
			const cacheReturn: Record<string, string> = {}
			for (const [k, v] of Object.entries(cacheResult)) {
				cacheReturn[`${key}.${k}`] = v
			}
			return cacheReturn
		}
	}
	return undefined
}

export const redisUpload = async (lang: string, ns: string, translations: TranslationMap) => {
	const expandedObj = unflatten<Record<string, string>, Record<string, string | Record<string, string>>>(
		translations
	)
	let hKeyCount = 0
	let itemCount = 0

	for (const [key, value] of Object.entries(expandedObj)) {
		const hKey = `${ns}:${key}:${lang}`
		const flatObj = flatten<string | Record<string, string>, Record<string, string>>(value)
		const suffixed: Record<string, string> = {}
		for (const [tkey, string] of Object.entries(flatObj)) {
			const langKey = `${tkey}`
			suffixed[langKey] = string
			itemCount++
		}
		await redis.hmset(hKey, suffixed)
		hKeyCount++
	}
	return {
		hashes: hKeyCount,
		items: itemCount,
	}
}
