import { beforeEach, describe, expect, it, vi } from 'vitest'

const store = new Map<string, number>()
const expirySeconds = new Map<string, number>()

vi.mock('@vercel/kv', () => ({
	kv: {
		incr: vi.fn(async (key: string) => {
			const next = (store.get(key) ?? 0) + 1
			store.set(key, next)
			return next
		}),
		expire: vi.fn(async (key: string, seconds: number) => {
			expirySeconds.set(key, seconds)
		}),
	},
}))

const { checkRateLimit } = await import('./index')

describe('checkRateLimit', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('allows calls up to the max within the window', async () => {
		const key = `test:${Math.random()}`
		for (let i = 0; i < 5; i++) {
			expect(await checkRateLimit(key, { max: 5, windowSeconds: 900 })).toBe(true)
		}
	})

	it('rejects once the max is exceeded', async () => {
		const key = `test:${Math.random()}`
		for (let i = 0; i < 5; i++) {
			await checkRateLimit(key, { max: 5, windowSeconds: 900 })
		}
		expect(await checkRateLimit(key, { max: 5, windowSeconds: 900 })).toBe(false)
	})

	it('sets an expiry only on the first call for a key', async () => {
		const { kv } = await import('@vercel/kv')
		const key = `test:${Math.random()}`
		await checkRateLimit(key, { max: 5, windowSeconds: 900 })
		await checkRateLimit(key, { max: 5, windowSeconds: 900 })

		expect(vi.mocked(kv.expire)).toHaveBeenCalledTimes(1)
		expect(vi.mocked(kv.expire)).toHaveBeenCalledWith(key, 900)
	})

	it('keys are independent of each other', async () => {
		const keyA = `test:${Math.random()}`
		const keyB = `test:${Math.random()}`
		for (let i = 0; i < 5; i++) {
			await checkRateLimit(keyA, { max: 5, windowSeconds: 900 })
		}
		expect(await checkRateLimit(keyB, { max: 5, windowSeconds: 900 })).toBe(true)
	})
})
