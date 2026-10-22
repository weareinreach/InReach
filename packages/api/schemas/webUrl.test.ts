import { describe, expect, it } from 'vitest'

import { withUrlScheme } from '@weareinreach/util/url'

import { webUrl, webUrlString } from './webUrl'

describe('withUrlScheme', () => {
	it.each([
		['www.example.org', 'https://www.example.org'],
		['example.org/path?q=1', 'https://example.org/path?q=1'],
		['  www.example.org  ', 'https://www.example.org'],
		['//www.example.org', 'https://www.example.org'],
		['http://example.org', 'http://example.org'],
		['https://example.org', 'https://example.org'],
		['HTTPS://example.org', 'HTTPS://example.org'],
		['mailto:help@example.org', 'mailto:help@example.org'],
		['', ''],
	])('%j -> %j', (input, expected) => {
		expect(withUrlScheme(input)).toBe(expected)
	})
})

describe('website/social URL save rules', () => {
	it('adds https:// before validating, so an address typed without it is accepted', () => {
		expect(webUrl('bad').parse('www.example.org')).toBe('https://www.example.org')
		expect(webUrlString().parse('www.1234.com')).toBe('https://www.1234.com')
	})

	it('still rejects something that is not a web address', () => {
		expect(webUrl('bad').safeParse('not a url at all').success).toBe(false)
	})
})
