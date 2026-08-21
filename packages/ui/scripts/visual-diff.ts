// Local visual regression check: screenshots every shared story from two running Storybook
// instances and pixel-diffs the pairs. Meant as a fast, on-demand pre-flight check before
// pushing (Chromatic remains the system of record for accepted baselines/team review).
//
// Every shared story is reported, ranked by diff percentage - there is no "pass" threshold,
// since even a small percentage can be a real, unacceptable design regression (a small
// component occupies a small fraction of the screenshot, so its diff percentage is naturally
// small even when the change is total). The --threshold flag only controls which stories get
// their images saved to disk, not what gets reported.
//
// Usage:
//   pnpm visual-diff [--base http://localhost:6007] [--compare http://localhost:6006]
//                     [--save-threshold 0.01] [--out ./visual-diff-output] [--concurrency 5]
//                     [--filter "Design System"]

import pixelmatch from 'pixelmatch'
import { chromium, type Page } from 'playwright'
import { PNG } from 'pngjs'

import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

import { fetchStories, sharedStoryIds } from './lib/storybook-index'

interface Args {
	baseUrl: string
	compareUrl: string
	saveThreshold: number
	outDir: string
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
		saveThreshold: Number(get('--save-threshold', '0.01')),
		outDir: get('--out', './visual-diff-output'),
		concurrency: Number(get('--concurrency', '5')),
		filter: argv.includes('--filter') ? get('--filter', '') : null,
	}
}

const VIEWPORT = { width: 1280, height: 900 }

const screenshotStory = async (page: Page, baseUrl: string, storyId: string): Promise<Buffer | null> => {
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
		// Let async data (MSW-mocked queries), fonts, and animations settle.
		await page.waitForTimeout(600)
		return await page.screenshot()
	} catch (err) {
		console.error(`  ! failed to screenshot ${storyId} @ ${baseUrl}: ${(err as Error).message}`)
		return null
	}
}

const diffPngs = (bufA: Buffer, bufB: Buffer): { diffPercent: number; diffPng: Buffer | null } => {
	const imgA = PNG.sync.read(bufA)
	const imgB = PNG.sync.read(bufB)

	if (imgA.width !== imgB.width || imgA.height !== imgB.height) {
		return { diffPercent: 100, diffPng: null }
	}

	const { width, height } = imgA
	const diff = new PNG({ width, height })
	const numDiffPixels = pixelmatch(imgA.data, imgB.data, diff.data, width, height, { threshold: 0.1 })
	const diffPercent = (numDiffPixels / (width * height)) * 100
	return { diffPercent, diffPng: numDiffPixels > 0 ? PNG.sync.write(diff) : null }
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

	if (!existsSync(args.outDir)) {
		mkdirSync(args.outDir, { recursive: true })
	}

	const browser = await chromium.launch()
	const results: { id: string; title: string; name: string; diffPercent: number }[] = []

	let cursor = 0
	let done = 0
	const worker = async () => {
		const context = await browser.newContext({ viewport: VIEWPORT })
		const pageBase = await context.newPage()
		const pageCompare = await context.newPage()
		while (cursor < sharedIds.length) {
			const id = sharedIds[cursor++] as string
			const [bufBase, bufCompare] = await Promise.all([
				screenshotStory(pageBase, args.baseUrl, id),
				screenshotStory(pageCompare, args.compareUrl, id),
			])
			done++
			if (!bufBase || !bufCompare) {
				continue
			}
			const { diffPercent, diffPng } = diffPngs(bufBase, bufCompare)
			const story = compareById.get(id)
			results.push({ id, title: story?.title ?? id, name: story?.name ?? id, diffPercent })
			if (diffPercent >= args.saveThreshold) {
				writeFileSync(join(args.outDir, `${id}.base.png`), bufBase)
				writeFileSync(join(args.outDir, `${id}.compare.png`), bufCompare)
				if (diffPng) {
					writeFileSync(join(args.outDir, `${id}.diff.png`), diffPng)
				}
			}
			console.log(`  [${done}/${sharedIds.length}] ${diffPercent.toFixed(2)}%  ${id}`)
		}
		await context.close()
	}

	await Promise.all(Array.from({ length: Math.max(1, args.concurrency) }, () => worker()))
	await browser.close()

	results.sort((a, b) => b.diffPercent - a.diffPercent)
	const changed = results.filter((r) => r.diffPercent > 0)
	const identical = results.length - changed.length

	console.log(`\n=== Full ranking (every shared story, no threshold) ===`)
	console.log(`${changed.length} / ${results.length} stories have any detected pixel difference`)
	console.log(`${identical} stories are pixel-identical\n`)
	for (const r of results) {
		console.log(`  ${r.diffPercent.toFixed(3).padStart(7)}%  ${r.title} › ${r.name}  (${r.id})`)
	}

	if (onlyInCompare.length) {
		console.log(`\nNew stories (not in baseline, skipped):`)
		onlyInCompare.forEach((id) => console.log(`  + ${id}`))
	}
	if (onlyInBase.length) {
		console.log(`\nRemoved stories (in baseline, not in current, skipped):`)
		onlyInBase.forEach((id) => console.log(`  - ${id}`))
	}

	const saved = results.filter((r) => r.diffPercent >= args.saveThreshold).length
	if (saved) {
		console.log(`\n${saved} stories' images (base/compare/diff) saved to: ${args.outDir}`)
	}

	process.exitCode = changed.length > 0 ? 1 : 0
}

main().catch((err) => {
	console.error(err)
	process.exitCode = 1
})
