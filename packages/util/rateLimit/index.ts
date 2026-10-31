import { kv } from '@vercel/kv'

/**
 * Fixed-window counter backed by the KV store already used elsewhere in this app (Crowdin caching). Returns
 * `false` once `max` calls for the same `key` have been made within `windowSeconds` of the first one - the
 * caller decides what that means (reject the request, show an error, etc).
 */
export const checkRateLimit = async (
	key: string,
	{ max, windowSeconds }: { max: number; windowSeconds: number }
): Promise<boolean> => {
	const count = await kv.incr(key)
	if (count === 1) {
		await kv.expire(key, windowSeconds)
	}
	return count <= max
}
