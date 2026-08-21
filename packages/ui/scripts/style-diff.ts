// Local computed-style regression check: for every shared story, walks the rendered DOM in both
// Storybook instances and compares actual computed CSS values element-by-element, rather than
// comparing rendered pixels. Reports the exact property and before/after value that changed
// (e.g. "border-color: rgb(217,217,217) -> rgb(0,181,92)"), which pixel diffing cannot do -
// it can only say "pixels differ", not "why".
//
// Complements visual-diff.ts rather than replacing it: this catches "wrong CSS value" precisely,
// but can't see genuine rendering/layout bugs (overlap, clipping, z-index) the way a pixel diff
// can. Element alignment between the two versions is done by document-order position, so results
// after a genuine structural change (extra/missing wrapper element) become unreliable - a
// "structure diverges" warning is reported per story when element counts don't match.
//
// Usage:
//   pnpm style-diff [--base http://localhost:6007] [--compare http://localhost:6006]
//                    [--filter "Design System"]

import { chromium, type Page } from 'playwright'

import { fetchStories, sharedStoryIds } from './lib/storybook-index'

interface Args {
	baseUrl: string
	compareUrl: string
	concurrency: number
	filter: string | null
}

const parseArgs = (): Args => {
	const argv = process.argv.slice(2)
	const get = (flag: string, fallback: string): string => {
		const idx = argv.indexOf(flag)
		const value = idx !== -1 ? argv[idx + 1] : undefined
		return value ?? fallback
	}
	return {
		baseUrl: get('--base', 'http://localhost:6007'),
		compareUrl: get('--compare', 'http://localhost:6006'),
		concurrency: Number(get('--concurrency', '5')),
		filter: argv.includes('--filter') ? get('--filter', '') : null,
	}
}

// Properties compared with exact string equality - any difference is meaningful.
const CATEGORICAL_PROPERTIES = [
	'color',
	'backgroundColor',
	'borderTopColor',
	'borderTopStyle',
	'fontWeight',
	'fontFamily',
	'textAlign',
	'textTransform',
	'opacity',
	'boxShadow',
	'display',
	'alignItems',
	'justifyContent',
] as const

// Length-valued properties - compared after rounding to the nearest pixel, so sub-pixel layout
// rounding (unrelated to any style rule) doesn't get reported as a false positive.
const LENGTH_PROPERTIES = [
	'borderTopWidth',
	'borderRadius',
	'fontSize',
	'letterSpacing',
	'lineHeight',
	'padding',
	'margin',
	'width',
	'height',
] as const

const ALL_PROPERTIES = [...CATEGORICAL_PROPERTIES, ...LENGTH_PROPERTIES]

interface ElementSnapshot {
	tag: string
	text: string
	styles: Record<string, string>
}

// Runs inside the browser page - must be a plain, serializable function (no outer closures).
const extractSnapshot = (properties: string[]): ElementSnapshot[] => {
	const root = document.getElementById('storybook-root')
	if (!root) return []
	// Mantine 9 injects <style> tags directly inside the render root (Mantine 6 injected them into
	// <head> via Emotion instead) - exclude non-visual tags so they don't shift element alignment.
	const NON_VISUAL_TAGS = new Set(['style', 'script', 'link'])
	const elements = [root, ...Array.from(root.querySelectorAll('*'))].filter(
		(el) =>
			!NON_VISUAL_TAGS.has(el.tagName.toLowerCase()) &&
			(el.tagName.toLowerCase() === 'svg' || el.closest('svg') === null)
	)

	return elements.map((el) => {
		const computed = window.getComputedStyle(el)
		const styles: Record<string, string> = {}
		for (const prop of properties) {
			styles[prop] = computed.getPropertyValue(prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`))
		}
		const ownText = Array.from(el.childNodes)
			.filter((n) => n.nodeType === Node.TEXT_NODE)
			.map((n) => n.textContent ?? '')
			.join('')
			.trim()
			.slice(0, 40)
		return { tag: el.tagName.toLowerCase(), text: ownText, styles }
	})
}

const normalizeLengthValue = (value: string): string =>
	value
		.split(' ')
		.map((token) => {
			const match = /^(-?\d+(?:\.\d+)?)px$/.exec(token)
			if (!match?.[1]) return token
			return `${Math.round(Number(match[1]))}px`
		})
		.join(' ')

// Mantine 9 switched some values to CSS logical keywords - these render pixel-identical to their
// physical equivalents in this app (no RTL support anywhere in the codebase), so treat them as equal.
const LOGICAL_KEYWORD_EQUIVALENTS: Record<string, string> = { start: 'left', end: 'right' }
const normalizeLogicalKeyword = (value: string): string => LOGICAL_KEYWORD_EQUIVALENTS[value] ?? value

const valuesDiffer = (property: string, before: string, after: string): boolean => {
	if ((LENGTH_PROPERTIES as readonly string[]).includes(property)) {
		return normalizeLengthValue(before) !== normalizeLengthValue(after)
	}
	if (property === 'textAlign') {
		return normalizeLogicalKeyword(before) !== normalizeLogicalKeyword(after)
	}
	return before !== after
}

interface StoryDiff {
	id: string
	title: string
	name: string
	structureDiverges: boolean
	baseCount: number
	compareCount: number
	changes: { index: number; tag: string; text: string; property: string; before: string; after: string }[]
	removed: { tag: string; text: string }[]
	added: { tag: string; text: string }[]
}

// Aligns two element sequences by longest-common-subsequence on tag name rather than raw index,
// so a single inserted/removed wrapper (e.g. an extra framework-internal div) doesn't cascade
// into spurious "everything after this point differs" noise for the rest of the tree. Text is
// deliberately excluded from the key - many stories render faker-mocked data, which differs
// between the two independent page loads even with no real bug, and matching on it would read
// that randomness as mass element churn.
const elementKey = (el: ElementSnapshot): string => el.tag

const alignByLcs = (
	base: ElementSnapshot[],
	compare: ElementSnapshot[]
): { baseIndex: number; compareIndex: number }[] => {
	const baseKeys = base.map(elementKey)
	const compareKeys = compare.map(elementKey)
	const n = baseKeys.length
	const m = compareKeys.length
	const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))
	for (let i = 1; i <= n; i++) {
		for (let j = 1; j <= m; j++) {
			const row = dp[i] as number[]
			const prevRow = dp[i - 1] as number[]
			row[j] =
				baseKeys[i - 1] === compareKeys[j - 1]
					? (prevRow[j - 1] as number) + 1
					: Math.max(prevRow[j] as number, row[j - 1] as number)
		}
	}
	const pairs: { baseIndex: number; compareIndex: number }[] = []
	let i = n
	let j = m
	while (i > 0 && j > 0) {
		if (baseKeys[i - 1] === compareKeys[j - 1]) {
			pairs.push({ baseIndex: i - 1, compareIndex: j - 1 })
			i--
			j--
		} else if ((dp[i - 1] as number[])[j]! >= (dp[i] as number[])[j - 1]!) {
			i--
		} else {
			j--
		}
	}
	pairs.reverse()
	return pairs
}

const snapshotStory = async (
	page: Page,
	baseUrl: string,
	storyId: string
): Promise<ElementSnapshot[] | null> => {
	const url = `${baseUrl}/iframe.html?id=${storyId}&viewMode=story`
	try {
		await page.goto(url, { waitUntil: 'load', timeout: 20000 })
		// Under concurrent load the dev server can take several seconds to compile/serve a story's
		// chunk, so #storybook-root is briefly empty - wait for real content, not a fixed delay.
		await page.waitForFunction(
			() => {
				const root = document.getElementById('storybook-root')
				return !!root && root.children.length > 0
			},
			{ timeout: 20000 }
		)
		await page.waitForTimeout(300)
		return await page.evaluate(extractSnapshot, ALL_PROPERTIES)
	} catch (err) {
		console.error(`  ! failed to snapshot ${storyId} @ ${baseUrl}: ${(err as Error).message}`)
		return null
	}
}

const compareSnapshots = (
	base: ElementSnapshot[],
	compare: ElementSnapshot[]
): Omit<StoryDiff, 'id' | 'title' | 'name'> => {
	const pairs = alignByLcs(base, compare)
	const changes: StoryDiff['changes'] = []
	const matchedBase = new Set(pairs.map((p) => p.baseIndex))
	const matchedCompare = new Set(pairs.map((p) => p.compareIndex))

	for (const { baseIndex, compareIndex } of pairs) {
		const baseEl = base[baseIndex] as ElementSnapshot
		const compareEl = compare[compareIndex] as ElementSnapshot
		for (const property of ALL_PROPERTIES) {
			const before = baseEl.styles[property] ?? ''
			const after = compareEl.styles[property] ?? ''
			if (valuesDiffer(property, before, after)) {
				changes.push({
					index: compareIndex,
					tag: compareEl.tag,
					text: compareEl.text,
					property,
					before,
					after,
				})
			}
		}
	}

	const removed = base.filter((_, i) => !matchedBase.has(i)).map((el) => ({ tag: el.tag, text: el.text }))
	const added = compare.filter((_, i) => !matchedCompare.has(i)).map((el) => ({ tag: el.tag, text: el.text }))

	return {
		structureDiverges: removed.length > 0 || added.length > 0,
		baseCount: base.length,
		compareCount: compare.length,
		changes,
		removed,
		added,
	}
}

const main = async () => {
	const args = parseArgs()
	console.log(`Baseline:  ${args.baseUrl}`)
	console.log(`Compare:   ${args.compareUrl}`)
	if (args.filter) console.log(`Filter:    "${args.filter}"`)
	console.log()

	const [baseStories, compareStories] = await Promise.all([
		fetchStories(args.baseUrl),
		fetchStories(args.compareUrl),
	])
	const { sharedIds, onlyInCompare, onlyInBase, compareById } = sharedStoryIds(
		baseStories,
		compareStories,
		args.filter
	)

	console.log(
		`${sharedIds.length} shared stories to compare, ${onlyInCompare.length} new, ${onlyInBase.length} removed\n`
	)

	const browser = await chromium.launch()
	const results: StoryDiff[] = []

	let cursor = 0
	let done = 0
	const worker = async () => {
		const context = await browser.newContext()
		const pageBase = await context.newPage()
		const pageCompare = await context.newPage()
		while (cursor < sharedIds.length) {
			const id = sharedIds[cursor++] as string
			const [base, compare] = await Promise.all([
				snapshotStory(pageBase, args.baseUrl, id),
				snapshotStory(pageCompare, args.compareUrl, id),
			])
			done++
			if (!base || !compare) {
				continue
			}
			const story = compareById.get(id)
			const diff = compareSnapshots(base, compare)
			results.push({ id, title: story?.title ?? id, name: story?.name ?? id, ...diff })
			console.log(`  [${done}/${sharedIds.length}] ${diff.changes.length} change(s)  ${id}`)
		}
		await context.close()
	}

	await Promise.all(Array.from({ length: Math.max(1, args.concurrency) }, () => worker()))
	await browser.close()

	results.sort((a, b) => b.changes.length - a.changes.length)
	const changed = results.filter((r) => r.changes.length > 0)

	console.log(`\n=== Full ranking (every shared story, no threshold) ===`)
	console.log(`${changed.length} / ${results.length} stories have at least one computed-style difference\n`)

	for (const r of results) {
		if (r.changes.length === 0 && !r.structureDiverges) continue
		console.log(`${r.title} › ${r.name}  (${r.id})`)
		if (r.structureDiverges) {
			console.log(
				`  ! DOM structure diverges: ${r.baseCount} elements (baseline) vs ${r.compareCount} elements (compare)`
			)
			for (const el of r.removed) {
				console.log(`    - removed (baseline only): <${el.tag}>${el.text ? ` "${el.text}"` : ''}`)
			}
			for (const el of r.added) {
				console.log(`    + added (compare only): <${el.tag}>${el.text ? ` "${el.text}"` : ''}`)
			}
		}
		for (const c of r.changes) {
			console.log(`  <${c.tag}>${c.text ? ` "${c.text}"` : ''} [#${c.index}]  ${c.property}:`)
			console.log(`      ${c.before}  ->  ${c.after}`)
		}
		console.log()
	}

	if (onlyInCompare.length) {
		console.log(`New stories (not in baseline, skipped):`)
		onlyInCompare.forEach((id) => console.log(`  + ${id}`))
	}
	if (onlyInBase.length) {
		console.log(`Removed stories (in baseline, not in current, skipped):`)
		onlyInBase.forEach((id) => console.log(`  - ${id}`))
	}

	process.exitCode = changed.length > 0 ? 1 : 0
}

main().catch((err) => {
	console.error(err)
	process.exitCode = 1
})
