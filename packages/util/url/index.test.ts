import { describe, expect, it } from 'vitest'

import { isSafeRelativePath, normalizeFullUrl, normalizeToDomain, urlMatchesPrefix } from './index'

describe('isSafeRelativePath', () => {
	it.each([
		['/org/some-slug', true],
		['/', true],
		['/account?tab=lists', true],
		['https://evil.com', false],
		['http://evil.com/path', false],
		['//evil.com', false],
		['/\\evil.com', false],
		['javascript:alert(1)', false],
		['', false],
	])('%s -> %s', (pathname, expected) => {
		expect(isSafeRelativePath(pathname)).toBe(expected)
	})
})

describe('normalizeToDomain', () => {
	it('strips scheme, www, and path', () => {
		expect(normalizeToDomain('https://www.Example.org/donate')).toBe('example.org')
	})
})

describe('normalizeFullUrl', () => {
	it('strips scheme, www, trailing slash, and lowercases, but keeps the path', () => {
		expect(normalizeFullUrl('HTTPS://WWW.Example.org/Donate/')).toBe('example.org/donate')
	})
})

describe('urlMatchesPrefix', () => {
	it('matches the prefix itself and anything nested under it', () => {
		expect(urlMatchesPrefix('test.com', 'test.com')).toBe(true)
		expect(urlMatchesPrefix('test.com/drs', 'test.com')).toBe(true)
	})

	it('does not match a different string that merely starts with the same characters', () => {
		expect(urlMatchesPrefix('test.com/drs', 'test.com/dr')).toBe(false)
	})
})
