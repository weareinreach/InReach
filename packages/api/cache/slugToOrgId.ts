import { kv as redis } from '@vercel/kv'

import { createLoggerInstance } from '@weareinreach/util/logger'

const log = createLoggerInstance('Cache - Slug to OrgId')

export const readSlugCache = async (slug: string) => {
	try {
		if ((await redis.ping()) !== 'PONG') {
			log.warn('Skipping cache read - Redis client not connected')
			return null
		}
		const organizationId = await redis.hget<string>('slugToOrgId', slug)
		return organizationId
	} catch (err) {
		log.error(err)
		return null
	}
}

export const writeSlugCache = async (slug: string, organizationId: string) => {
	try {
		if ((await redis.ping()) !== 'PONG') {
			log.warn('Skipping cache write - Redis client not connected')
			return
		}
		await redis.hset('slugToOrgId', { [slug]: organizationId })
	} catch (err) {
		log.error(err)
	}
}
