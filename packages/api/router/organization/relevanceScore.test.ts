import { describe, expect, it } from 'vitest'

import { SEARCH_CONFIG } from './searchConfig'

// Purely a Prisma.sql fragment builder - no DB, no mocking needed. Assertions are against the
// generated SQL text/params shape (`.sql`/`.values`, the real Prisma.Sql fragment properties),
// not against actual query results.
const { buildRelevanceSortSql, buildTieBreakerSql } = await import('./relevanceScore')

describe('buildRelevanceSortSql', () => {
	it('2.1: with no focuses, the priority-multiplier term is omitted entirely - score is distance-decay only', () => {
		const frag = buildRelevanceSortSql({ focuses: [] })

		expect(frag.sql).not.toContain('matchedAttributes')
		expect(frag.sql).toContain('CASE WHEN distance IS NULL THEN 0')
	})

	it('2.1b: an absent `focuses` key behaves the same as an empty array (the param default)', () => {
		const withDefault = buildRelevanceSortSql({})
		const withEmpty = buildRelevanceSortSql({ focuses: [] })

		expect(withDefault.sql).toBe(withEmpty.sql)
		expect(withDefault.values).toEqual(withEmpty.values)
	})

	it('2.2: each selected focus is weighted by its 1-based rank via SEARCH_CONFIG.priorityWeights, in selection order', () => {
		const frag = buildRelevanceSortSql({ focuses: ['tag-a', 'tag-b', 'tag-c'] })

		// Three focuses -> three COALESCE(CASE WHEN ... THEN <weight> ELSE 0 END, 0) terms joined by ' + '.
		const caseTerms = frag.sql.match(
			/COALESCE\(CASE WHEN "matchedAttributes" @> ARRAY\[\?\]::text\[\] THEN \? ELSE 0 END, 0\)/g
		)
		expect(caseTerms).toHaveLength(3)

		// Values interleave [tagId, weight] per focus, in the same order focuses were given - first
		// selected (rank 1) must carry SEARCH_CONFIG.priorityWeights[1], not an arbitrary/reversed order.
		expect(frag.values).toEqual([
			'tag-a',
			SEARCH_CONFIG.priorityWeights[1],
			'tag-b',
			SEARCH_CONFIG.priorityWeights[2],
			'tag-c',
			SEARCH_CONFIG.priorityWeights[3],
		])
	})

	it('2.3: a rank beyond SEARCH_CONFIG.priorityWeights falls back to weight 0, not NaN/undefined', () => {
		const sixFocuses = ['a', 'b', 'c', 'd', 'e', 'f']
		const frag = buildRelevanceSortSql({ focuses: sixFocuses })

		// Rank 6 has no configured weight - the `?? 0` fallback must produce a real numeric 0, not
		// break the fragment by interpolating `undefined`/NaN into the SQL params.
		expect(frag.values.at(-1)).toBe(0)
		expect(frag.values.every((v) => v !== undefined && !Number.isNaN(v))).toBe(true)
	})

	it('2.4: distance IS NULL (national/remote match) contributes 0 to the score, not NaN or an error', () => {
		const frag = buildRelevanceSortSql({ focuses: [] })

		expect(frag.sql).toMatch(
			/CASE WHEN distance IS NULL THEN 0 ELSE \(1\.0 \/ \(1\.0 \+ \(distance::float \/ 1000\.0\)\)\) END/
		)
	})

	it("2.5: sortBias is accepted as a parameter but has zero effect on the generated SQL - confirms it's currently a dead parameter, not a working DISTANCE/RELEVANCE switch", () => {
		// The only live caller of this dead param is SortBiasSelector.tsx, which isn't rendered
		// anywhere in the app (confirmed via grep - zero usages) - so this isn't a reachable
		// user-facing bug today, but it IS the actual backend behavior a future "Best Match" sort
		// would need to implement. This test exists so wiring that UI back up without also finishing
		// this function produces a visible, specific failure instead of a silent no-op.
		const distanceBias = buildRelevanceSortSql({ focuses: ['tag-a'] }, 'DISTANCE')
		const relevanceBias = buildRelevanceSortSql({ focuses: ['tag-a'] }, 'RELEVANCE')

		expect(distanceBias.sql).toBe(relevanceBias.sql)
		expect(distanceBias.values).toEqual(relevanceBias.values)
	})
})

describe('buildTieBreakerSql', () => {
	it('orders by slug ascending, for deterministic pagination when distance/relevance tie', () => {
		const frag = buildTieBreakerSql()

		expect(frag.sql.trim()).toBe('"slug" ASC')
	})
})
