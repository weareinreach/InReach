import { kv as redis } from '@vercel/kv'

import { createLoggerInstance } from '@weareinreach/util/logger'

const log = createLoggerInstance('Cache - Slug redirect')

export const readSlugRedirectCache = async (slug: string) => {
	log.info({ slug }, 'Reading slug redirect cache...')
	try {
		if ((await redis.ping()) !== 'PONG') {
			log.warn('Skipping cache read - Redis client not connected')
			return null
		}
		const redirectedSlug = await redis.hget<string>('slugRedirect', slug)
		if (redirectedSlug) {
			log.info({ slug, redirectTo: redirectedSlug }, 'Slug redirect found in cache')
		}
		return redirectedSlug
	} catch (err) {
		log.error(err)
		return null
	}
}

export const writeSlugRedirectCache = async (slug: string, redirectTo: string) => {
	try {
		if ((await redis.ping()) !== 'PONG') {
			log.warn('Skipping cache write - Redis client not connected')
			return
		}
		await redis.hset('slugRedirect', { [slug]: redirectTo })
	} catch (err) {
		log.error(err)
	}
}
