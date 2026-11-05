import { timingSafeEqual } from 'node:crypto'

/**
 * Constant-time string equality, for comparing a caller-supplied secret/token against the real one - a plain
 * `===` leaks timing information proportional to how many leading characters match, which an attacker can use
 * to guess a secret one character at a time. Returns `false` (not a throw) for a length mismatch, since
 * `timingSafeEqual` itself throws on unequal-length buffers.
 */
export const safeEqual = (a: string, b: string) => {
	const bufA = Buffer.from(a)
	const bufB = Buffer.from(b)
	return bufA.length === bufB.length && timingSafeEqual(bufA, bufB)
}
