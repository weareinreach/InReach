import { spawn } from 'node:child_process'
import { createReadStream, existsSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Local test dashboard: one page, organized by feature area (not package), with a Run button per row that
 * actually triggers the suite and live-updates once it's done. Vitest/Playwright each write their
 * HTML+coverage reports to one fixed directory per config - rows sharing a package (packages/ui's "general"
 * vs "data-portal" subsets) use `--outputFile.html`/ `--coverage.reportsDirectory` (Vitest) or
 * `PLAYWRIGHT_HTML_REPORT` (Playwright) to give each row its own isolated report directory, so running one
 * row never clobbers another's results.
 *
 * Each route below lives in its own small `RouteHandler` function (see `ROUTES`) rather than one large
 * branching handler, to stay under the linter's cognitive-complexity limit.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PORT = 4500

type Row = {
	id: string
	label: string
	section: string
	cwd: string
	cmd: string
	args: string[]
	env?: Record<string, string>
	results: string
	coverage: string | null
	/**
	 * True source-coverage rows (not scoped to a doc's test cases) - after the run, parse
	 * <coverage>/coverage-summary.json for an overall % and a list of files with zero coverage, so "no test
	 * imports this file at all" is visible instead of silently absent from any report.
	 */
	parseCoverage?: boolean
}

type DocStatus = {
	file: string
	label: string
	summary: string
}

// Snapshot, not live-synced - update this (and KNOWN_ISSUES below) when a doc's own Status column
// changes materially. Each doc is the actual source of truth per-case; this is just the "don't have to
// ask" summary layer on top.
const DOCS: DocStatus[] = [
	{
		file: 'search-test-inventory.md',
		label: 'Public search UI (Vitest + Playwright)',
		summary: '100% — all 15 sections worked through',
	},
	{
		file: 'site-chrome-test-inventory.md',
		label: 'Site-wide chrome — modals, navbar, footer',
		summary: '100% — §3d/§3e partially blocked, no Playwright auth fixture exists yet',
	},
	{
		file: 'search-api-test-inventory.md',
		label: 'Backend/tRPC layer behind both of the above',
		summary:
			'100% — a handful of cases (§1.5, §1.7, §1.14, one product decision) explicitly Not started with a stated reason, not silently skipped',
	},
]

type IssueStatus = {
	num: number
	title: string
	type: 'Bug' | 'Task'
	layer: string
}

// Snapshot as of 2026-09-23 - all filed OPEN, confirmed via `gh issue list`. Re-check
// https://github.com/weareinreach/InReach/issues for current open/closed state; this list exists so
// you don't have to ask what was found, not as a live status feed.
const KNOWN_ISSUES: IssueStatus[] = [
	{
		num: 2058,
		title: 'Search results page 500s on a malformed URL instead of showing an error',
		type: 'Bug',
		layer: 'search UI',
	},
	{
		num: 2059,
		title: 'Search results page 500s on a non-numeric ?page= value instead of falling back to page 1',
		type: 'Bug',
		layer: 'search UI',
	},
	{
		num: 2060,
		title: 'SearchBox: a failed geocoding lookup fails silently, no error shown to the user',
		type: 'Bug',
		layer: 'search UI',
	},
	{
		num: 2061,
		title: 'Search results page shows infinite loading skeletons if the results query fails, no error state',
		type: 'Bug',
		layer: 'search UI',
	},
	{
		num: 2062,
		title: 'Save/favorite state relies on an unenforced API contract (Boolean([]) is truthy)',
		type: 'Task',
		layer: 'search UI',
	},
	{
		num: 2063,
		title: 'resultCount reports 0 at an out-of-range search results page, even when real matches exist',
		type: 'Bug',
		layer: 'search UI',
	},
	{
		num: 2064,
		title:
			"ServiceFilter checkboxes don't visually reflect selection state (parent/child react-hook-form subscriptions desync)",
		type: 'Bug',
		layer: 'search UI',
	},
	{
		num: 2065,
		title: 'Search results page-2 prefetch never fires on a fresh search (no ?page= in URL)',
		type: 'Bug',
		layer: 'search UI',
	},
	{
		num: 2066,
		title: 'Search results page has a 500-768px dead zone with no sidebar and no mobile sort controls',
		type: 'Bug',
		layer: 'search UI',
	},
	{
		num: 2067,
		title: "intl/[country] page doesn't uppercase the country code before Intl.DisplayNames.of()",
		type: 'Task',
		layer: 'search UI',
	},
	{
		num: 2068,
		title: "Cookie-consent banner overlaps the anti-hate modal's Accept button on mobile",
		type: 'Bug',
		layer: 'site chrome',
	},
	{
		num: 2069,
		title: 'No navbar renders at all at exactly the 768px sm breakpoint',
		type: 'Bug',
		layer: 'site chrome',
	},
	{
		num: 2070,
		title: 'Entire footer collapses to zero size on any viewport at or below 768px',
		type: 'Bug',
		layer: 'site chrome',
	},
	{
		num: 2071,
		title: "Footer's Powered by Vercel link opens in the same tab, unlike every other external link",
		type: 'Bug',
		layer: 'site chrome',
	},
	{
		num: 2074,
		title: "savedList.shareUrl / unShareUrl let any user share or unshare another user's saved list",
		type: 'Bug',
		layer: 'search API',
	},
	{
		num: 2075,
		title: "geo.autocomplete's error-status handling is dead code against real Google API error responses",
		type: 'Task',
		layer: 'search API',
	},
	{
		num: 2076,
		title: 'organization.getAlerts can emit a text-less alert entry, unlike location.getAlerts',
		type: 'Task',
		layer: 'search API',
	},
	{
		num: 2077,
		title: 'Search results at exactly zero distance show distance: null instead of 0',
		type: 'Bug',
		layer: 'search API',
	},
]

const KNOWN_GAPS: string[] = [
	'No Playwright authenticated-session fixture exists anywhere in the repo - blocks most of site-chrome §3d/§3e (account menu, logged-in states) and tests/crud entirely.',
	"packages/api's tests - old and new, mocked and real-DB alike - don't run in CI at all. .github/workflows/test.yml only runs packages/ui.",
	'No data-portal/edit-side test-case inventory doc exists yet - staff-facing org/service editing has no structured tracking (separate from the org-table-filter feature merged in from dev, which this effort never tested).',
	'§1.5 (combined services+attributes filter), §1.7 (ServiceArea/national-match real-DB cases), §1.14 (V1/V2/V3 router dispatch) in search-api-test-inventory - not started, needs more fixture setup.',
]

const ROWS: Row[] = [
	{
		id: 'general',
		label: 'General UI components',
		section: 'General',
		cwd: 'packages/ui',
		cmd: 'pnpm',
		args: ['run', 'test:report:general'],
		results: 'packages/ui/reports/general/results',
		coverage: 'packages/ui/reports/general/coverage',
	},
	{
		id: 'search-components',
		label:
			'Search UI components (packages/ui - SearchBox, SearchResultCard, Save, Pagination, LocationBasedAlertBanner, ServiceFilter, MoreFilter, SearchResultSidebar, SortResults)',
		section: 'View / Search',
		cwd: 'packages/ui',
		cmd: 'pnpm',
		args: ['run', 'test:report:search'],
		results: 'packages/ui/reports/search/results',
		coverage: 'packages/ui/reports/search/coverage',
	},
	{
		id: 'search-e2e',
		label: 'Search - behavioral (Playwright e2e)',
		section: 'View / Search',
		cwd: 'apps/app',
		cmd: 'pnpm',
		args: [
			'exec',
			'playwright',
			'test',
			'tests/search/home.spec.ts',
			'tests/search/url-routing.spec.ts',
			'tests/search/results-rendering.spec.ts',
			'tests/search/sort-drawer.spec.ts',
			'tests/search/pagination.spec.ts',
			'tests/search/responsive.spec.ts',
			'tests/search/intl-fallback.spec.ts',
			'tests/search/location-alert-banner.spec.ts',
		],
		env: { PLAYWRIGHT_HTML_REPORT: 'reports/search/results' },
		results: 'apps/app/reports/search/results',
		coverage: null,
	},
	{
		id: 'search-visual',
		label: 'Search - visual regression (page-level screenshots, not Storybook)',
		section: 'View / Search',
		cwd: 'apps/app',
		cmd: 'pnpm',
		args: ['exec', 'playwright', 'test', 'tests/search/visual.spec.ts'],
		env: { PLAYWRIGHT_HTML_REPORT: 'reports/search-visual/results' },
		results: 'apps/app/reports/search-visual/results',
		coverage: null,
	},
	{
		id: 'search-device-flow',
		label: 'Search - full flow on real mobile/tablet device emulation',
		section: 'View / Search',
		cwd: 'apps/app',
		cmd: 'pnpm',
		args: [
			'exec',
			'playwright',
			'test',
			'tests/search/device-flow.spec.ts',
			'--project=mobile',
			'--project=tablet',
		],
		env: { PLAYWRIGHT_HTML_REPORT: 'reports/search-device-flow/results' },
		results: 'apps/app/reports/search-device-flow/results',
		coverage: null,
	},
	{
		id: 'site-chrome-e2e',
		label: 'Site chrome - behavioral (Playwright e2e - anti-hate modal, cookie consent, navbar, footer)',
		section: 'View / Search',
		cwd: 'apps/app',
		cmd: 'pnpm',
		args: [
			'exec',
			'playwright',
			'test',
			'tests/site-chrome/anti-hate-modal.spec.ts',
			'tests/site-chrome/cookie-consent.spec.ts',
			'tests/site-chrome/navbar-desktop.spec.ts',
			'tests/site-chrome/navbar-mobile.spec.ts',
			'tests/site-chrome/language-picker-desktop.spec.ts',
			'tests/site-chrome/user-menu.spec.ts',
			'tests/site-chrome/login-signup-modals.spec.ts',
			'tests/site-chrome/footer.spec.ts',
		],
		env: { PLAYWRIGHT_HTML_REPORT: 'reports/site-chrome/results' },
		results: 'apps/app/reports/site-chrome/results',
		coverage: null,
	},
	{
		id: 'data-portal-ui',
		label: 'Data-portal UI components (packages/ui)',
		section: 'Edit / Data-Portal',
		cwd: 'packages/ui',
		cmd: 'pnpm',
		args: ['run', 'test:report:data-portal'],
		results: 'packages/ui/reports/data-portal/results',
		coverage: 'packages/ui/reports/data-portal/coverage',
	},
	{
		id: 'data-portal-api',
		label: 'Data-portal backend (packages/api - all of it, see note)',
		section: 'Edit / Data-Portal',
		cwd: 'packages/api',
		cmd: 'pnpm',
		args: ['run', 'test:report'],
		results: 'packages/api/html',
		coverage: 'packages/api/coverage',
	},
	{
		id: 'data-portal-e2e',
		label: 'Data-portal (Playwright e2e, tests/crud - empty until the auth fixture exists)',
		section: 'Edit / Data-Portal',
		cwd: 'apps/app',
		cmd: 'pnpm',
		args: ['exec', 'playwright', 'test', 'tests/crud'],
		env: { PLAYWRIGHT_HTML_REPORT: 'reports/crud/results' },
		results: 'apps/app/reports/crud/results',
		coverage: null,
	},
	{
		id: 'full-coverage-api',
		label:
			'Real source coverage - packages/api (router/** + lib/**, every file counted whether any test imports it or not)',
		section: 'Code Coverage',
		cwd: 'packages/api',
		cmd: 'pnpm',
		args: [
			'exec',
			'vitest',
			'run',
			'--coverage',
			'--coverage.include=router/**/*.ts',
			'--coverage.include=lib/**/*.ts',
			'--coverage.exclude=**/*.test.ts',
			'--coverage.exclude=**/*.schema.ts',
			'--reporter=html',
			'--outputFile.html=reports/full-coverage/results/index.html',
			'--coverage.reportsDirectory=reports/full-coverage/coverage',
		],
		results: 'packages/api/reports/full-coverage/results',
		coverage: 'packages/api/reports/full-coverage/coverage',
		parseCoverage: true,
	},
	{
		id: 'full-coverage-ui',
		label:
			'Real source coverage - packages/ui (components/modals/hooks/etc, every file counted whether any test imports it or not)',
		section: 'Code Coverage',
		cwd: 'packages/ui',
		cmd: 'pnpm',
		args: [
			'exec',
			'vitest',
			'run',
			'--coverage',
			'--coverage.include={components,modals,hooks,providers,theme,lib,utils,icon,layouts,loading-states,store,types}/**/*.{ts,tsx}',
			'--coverage.exclude=**/*.test.{ts,tsx}',
			'--coverage.exclude=**/*.stories.tsx',
			'--coverage.exclude=**/*.d.ts',
			'--reporter=html',
			'--outputFile.html=reports/full-coverage/results/index.html',
			'--coverage.reportsDirectory=reports/full-coverage/coverage',
		],
		results: 'packages/ui/reports/full-coverage/results',
		coverage: 'packages/ui/reports/full-coverage/coverage',
		parseCoverage: true,
	},
]

type CoverageSummary = {
	statementsPct: number
	branchesPct: number
	functionsPct: number
	linesPct: number
	totalFiles: number
	zeroCoverageCount: number
}

type RunState = {
	running: boolean
	lastExitCode: number | null
	lastRunAt: string | null
	lastOutputTail: string
	coverageSummary: CoverageSummary | null
}

const state = new Map<string, RunState>(
	ROWS.map((r) => [
		r.id,
		{ running: false, lastExitCode: null, lastRunAt: null, lastOutputTail: '', coverageSummary: null },
	])
)
const MIME: Record<string, string> = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'application/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.ico': 'image/x-icon',
	'.gz': 'application/octet-stream',
}

type CoverageMetric = { total: number; covered: number; skipped: number; pct: number | 'Unknown' }
type CoverageFileEntry = {
	statements: CoverageMetric
	branches: CoverageMetric
	functions: CoverageMetric
	lines: CoverageMetric
}
type CoverageSummaryJson = Record<string, CoverageFileEntry> & { total: CoverageFileEntry }

/**
 * Reads the v8 coverage-summary.json a `parseCoverage` row just produced, computes the overall % and every
 * file at exactly 0% statement coverage (imported by nothing under test, not just weakly tested), and writes
 * that file list out as plain text next to the report so it's linkable without bloating the dashboard page
 * itself.
 */
const parseCoverageSummary = (row: Row): CoverageSummary | null => {
	if (!row.coverage) {
		return null
	}
	const summaryPath = path.join(ROOT, row.coverage, 'coverage-summary.json')
	if (!existsSync(summaryPath)) {
		return null
	}
	let json: CoverageSummaryJson
	try {
		json = JSON.parse(readFileSync(summaryPath, 'utf-8')) as CoverageSummaryJson
	} catch {
		return null
	}
	const fileKeys = Object.keys(json).filter((k) => k !== 'total')
	const zeroCoverageFiles = fileKeys
		.filter((k) => json[k]?.statements.pct === 0)
		.map((k) => path.relative(path.join(ROOT, row.cwd), k))
		.sort((a, b) => a.localeCompare(b))

	writeFileSync(
		path.join(ROOT, row.coverage, 'zero-coverage-files.txt'),
		`${zeroCoverageFiles.length} of ${fileKeys.length} files have zero test coverage (nothing under test imports them):\n\n${zeroCoverageFiles.join('\n')}\n`
	)

	const pctOf = (m: CoverageMetric) => (typeof m.pct === 'number' ? m.pct : 0)
	return {
		statementsPct: pctOf(json.total.statements),
		branchesPct: pctOf(json.total.branches),
		functionsPct: pctOf(json.total.functions),
		linesPct: pctOf(json.total.lines),
		totalFiles: fileKeys.length,
		zeroCoverageCount: zeroCoverageFiles.length,
	}
}

const runRow = (row: Row) => {
	const st = state.get(row.id)
	if (!st || st.running) {
		return
	}
	st.running = true
	st.lastOutputTail = ''
	const child = spawn(row.cmd, row.args, {
		cwd: path.join(ROOT, row.cwd),
		env: { ...process.env, ...row.env },
		shell: false,
	})
	const capture = (chunk: Buffer) => {
		st.lastOutputTail = (st.lastOutputTail + chunk.toString()).slice(-4000)
	}
	child.stdout?.on('data', capture)
	child.stderr?.on('data', capture)
	child.on('close', (code) => {
		st.running = false
		st.lastExitCode = code
		st.lastRunAt = new Date().toISOString()
		if (row.parseCoverage) {
			st.coverageSummary = parseCoverageSummary(row)
		}
	})
}

const sendFile = (res: http.ServerResponse, absPath: string) => {
	const ext = path.extname(absPath)
	res.writeHead(200, {
		'Content-Type': MIME[ext] ?? 'application/octet-stream',
		'Cache-Control': 'no-store',
	})
	createReadStream(absPath).pipe(res)
}

const escapeHtml = (s: string) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const renderStatusOverview = () => {
	const docsHtml = DOCS.map(
		(d) => `
		<tr>
			<td>${escapeHtml(d.label)}</td>
			<td>${escapeHtml(d.summary)}</td>
			<td><a href="/docs/${d.file}" target="_blank">view doc</a></td>
		</tr>`
	).join('')

	const issuesHtml = KNOWN_ISSUES.map(
		(i) => `
		<tr>
			<td><a href="https://github.com/weareinreach/InReach/issues/${i.num}" target="_blank">#${i.num}</a></td>
			<td><span class="badge badge-${i.type.toLowerCase()}">${i.type}</span></td>
			<td>${escapeHtml(i.layer)}</td>
			<td>${escapeHtml(i.title)}</td>
		</tr>`
	).join('')

	const gapsHtml = KNOWN_GAPS.map((g) => `<li>${escapeHtml(g)}</li>`).join('')

	const coverageRows = ROWS.filter((r) => r.parseCoverage)
	const coverageHtml = coverageRows
		.map((r) => {
			const s = state.get(r.id)?.coverageSummary
			let zeroCoverageClass = ''
			if (s) {
				zeroCoverageClass = s.zeroCoverageCount > 0 ? 'fail' : 'ok'
			}
			return `
			<tr id="cov-row-${r.id}">
				<td>${escapeHtml(r.label)}</td>
				<td id="cov-pct-${r.id}">${s ? `${s.statementsPct.toFixed(1)}% statements · ${s.branchesPct.toFixed(1)}% branches · ${s.functionsPct.toFixed(1)}% functions · ${s.linesPct.toFixed(1)}% lines` : '<span class="muted">not run yet</span>'}</td>
				<td id="cov-zero-${r.id}" class="${zeroCoverageClass}">${s ? `${s.zeroCoverageCount} / ${s.totalFiles} files at 0% coverage` : '<span class="muted">—</span>'}</td>
				<td id="cov-link-${r.id}">${s ? `<a href="/reports/${r.id}/coverage/zero-coverage-files.txt" target="_blank">view list</a>` : '<span class="muted">run below to generate</span>'}</td>
			</tr>`
		})
		.join('')

	return `
	<h2>Real source coverage <span class="note">— every file counted, not just ones a test happens to import; see "Code Coverage" section below to (re)run</span></h2>
	<table>
		<thead><tr><th>Package</th><th>Overall %</th><th>Zero-coverage files</th><th></th></tr></thead>
		<tbody>${coverageHtml}</tbody>
	</table>

	<h2>Coverage docs</h2>
	<table>
		<thead><tr><th>Layer</th><th>Status</th><th></th></tr></thead>
		<tbody>${docsHtml}</tbody>
	</table>

	<h2>Filed issues (${KNOWN_ISSUES.length}) <span class="note">— all open as of the last check; click through for current state</span></h2>
	<table>
		<thead><tr><th>#</th><th>Type</th><th>Layer</th><th>Title</th></tr></thead>
		<tbody>${issuesHtml}</tbody>
	</table>

	<h2>Known gaps</h2>
	<ul class="gaps">${gapsHtml}</ul>
	`
}

const renderPage = () => {
	const sections = [...new Set(ROWS.map((r) => r.section))]
	const rowsHtml = sections
		.map(
			(section) => `
		<h2>${section}</h2>
		<table>
			<thead><tr><th>Suite</th><th>Run</th><th>Status</th><th>Results</th><th>Coverage</th></tr></thead>
			<tbody>
			${ROWS.filter((r) => r.section === section)
				.map(
					(r) => `
				<tr id="row-${r.id}">
					<td>${r.label}</td>
					<td><button onclick="runRow('${r.id}')" id="btn-${r.id}">Run</button></td>
					<td id="status-${r.id}">—</td>
					<td><a href="/reports/${r.id}/results/" target="_blank">results</a></td>
					<td>${r.coverage ? `<a href="/reports/${r.id}/coverage/" target="_blank">coverage</a>` : '<span class="muted">n/a</span>'}</td>
				</tr>`
				)
				.join('')}
			</tbody>
		</table>`
		)
		.join('')

	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Test Dashboard</title>
<style>
	body { font: 15px/1.5 -apple-system, system-ui, sans-serif; max-width: 800px; margin: 2.5rem auto; padding: 0 1rem; }
	h1 { font-size: 1.4rem; }
	h2 { font-size: 1.05rem; margin-top: 2rem; border-bottom: 1px solid #ddd; padding-bottom: .3rem; }
	table { width: 100%; border-collapse: collapse; margin-top: .5rem; }
	td, th { text-align: left; padding: .4rem .5rem; border-bottom: 1px solid #eee; font-size: .92rem; }
	button { cursor: pointer; }
	.muted { color: #999; }
	.ok { color: #0a7a2a; }
	.fail { color: #b00; }
	.running { color: #b8860b; }
	.note { color: #666; font-size: .85rem; font-weight: normal; }
	.badge { font-size: .78rem; padding: .1rem .45rem; border-radius: .75rem; font-weight: 600; }
	.badge-bug { background: #fde2e2; color: #a11; }
	.badge-task { background: #fff3cd; color: #8a6d00; }
	ul.gaps { padding-left: 1.2rem; }
	ul.gaps li { margin: .35rem 0; font-size: .92rem; }
	.overview { background: #fafafa; border: 1px solid #eee; border-radius: 8px; padding: 0 1.25rem 1.25rem; margin-bottom: 2.5rem; }
	.overview h2:first-child { margin-top: 1.25rem; }
</style>
</head>
<body>
<h1>Test Dashboard</h1>
<div class="overview">
${renderStatusOverview()}
</div>
<p class="note">Click Run, wait for the status to update, then open Results/Coverage. Rows never clobber each other's reports - each has its own output directory.</p>
${rowsHtml}
<script>
async function runRow(id) {
	document.getElementById('btn-' + id).disabled = true
	const el = document.getElementById('status-' + id)
	el.textContent = 'running…'
	el.className = 'running'
	await fetch('/run/' + id, { method: 'POST', cache: 'no-store' })
	poll(id)
}
async function poll(id) {
	const res = await fetch('/status/' + id, { cache: 'no-store' })
	const s = await res.json()
	const el = document.getElementById('status-' + id)
	const btn = document.getElementById('btn-' + id)
	if (s.running) {
		el.textContent = 'running…'
		el.className = 'running'
		setTimeout(() => poll(id), 1500)
	} else {
		btn.disabled = false
		if (s.lastExitCode === null) { el.textContent = '—'; el.className = '' }
		else if (s.lastExitCode === 0) { el.textContent = 'passed ✓'; el.className = 'ok' }
		else { el.textContent = 'failed ✗ (exit ' + s.lastExitCode + ')'; el.className = 'fail' }
		if (document.getElementById('cov-pct-' + id)) refreshCoverageOverview(id)
	}
}
async function refreshCoverageOverview(id) {
	const res = await fetch('/coverage-summary/' + id, { cache: 'no-store' })
	const s = await res.json()
	if (!s) return
	document.getElementById('cov-pct-' + id).textContent =
		s.statementsPct.toFixed(1) + '% statements · ' + s.branchesPct.toFixed(1) + '% branches · ' +
		s.functionsPct.toFixed(1) + '% functions · ' + s.linesPct.toFixed(1) + '% lines'
	const zeroEl = document.getElementById('cov-zero-' + id)
	zeroEl.textContent = s.zeroCoverageCount + ' / ' + s.totalFiles + ' files at 0% coverage'
	zeroEl.className = s.zeroCoverageCount > 0 ? 'fail' : 'ok'
	document.getElementById('cov-link-' + id).innerHTML =
		'<a href="/reports/' + id + '/coverage/zero-coverage-files.txt" target="_blank">view list</a>'
}
${ROWS.map((r) => `poll('${r.id}')`).join('\n')}
</script>
</body>
</html>`
}

type RouteHandler = (req: http.IncomingMessage, res: http.ServerResponse, url: URL) => boolean

// Each route lives in its own small function - `server`'s own request handler is then just a flat
// sequence of "did this route claim the request" checks, kept simple enough to stay under the linter's
// cognitive-complexity limit rather than one large branching function.

const handleHome: RouteHandler = (_req, res, url) => {
	if (url.pathname !== '/') {
		return false
	}
	res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
	res.end(renderPage())
	return true
}

const handleRun: RouteHandler = (req, res, url) => {
	if (!url.pathname.startsWith('/run/') || req.method !== 'POST') {
		return false
	}
	const id = url.pathname.slice('/run/'.length)
	const row = ROWS.find((r) => r.id === id)
	if (!row) {
		res.writeHead(404)
		res.end()
		return true
	}
	runRow(row)
	res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
	res.end(JSON.stringify({ started: true }))
	return true
}

const handleCoverageSummary: RouteHandler = (_req, res, url) => {
	if (!url.pathname.startsWith('/coverage-summary/')) {
		return false
	}
	const id = url.pathname.slice('/coverage-summary/'.length)
	const st = state.get(id)
	res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
	res.end(JSON.stringify(st?.coverageSummary ?? null))
	return true
}

const handleStatus: RouteHandler = (_req, res, url) => {
	if (!url.pathname.startsWith('/status/')) {
		return false
	}
	const id = url.pathname.slice('/status/'.length)
	const st = state.get(id)
	res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
	res.end(JSON.stringify(st ?? { running: false, lastExitCode: null, lastRunAt: null }))
	return true
}

const handleDocs: RouteHandler = (_req, res, url) => {
	if (!url.pathname.startsWith('/docs/')) {
		return false
	}
	const file = url.pathname.slice('/docs/'.length)
	// Restrict to known coverage docs only - no arbitrary path traversal into docs/Testing/.
	const doc = DOCS.find((d) => d.file === file)
	if (!doc) {
		res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
		res.end('Not found - this dashboard only serves the three coverage docs it tracks.')
		return true
	}
	const filePath = path.join(ROOT, 'docs/Testing', doc.file)
	if (!existsSync(filePath)) {
		res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
		res.end('Doc file missing on disk.')
		return true
	}
	res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' })
	createReadStream(filePath).pipe(res)
	return true
}

const handleReports: RouteHandler = (_req, res, url) => {
	if (!url.pathname.startsWith('/reports/')) {
		return false
	}
	const rest = url.pathname.slice('/reports/'.length) // "<rowId>/<results|coverage>/..."
	const [id, kind, ...fileParts] = rest.split('/')
	const row = ROWS.find((r) => r.id === id)
	const baseRel = kind === 'coverage' ? row?.coverage : row?.results
	if (!row || !baseRel) {
		// Deliberately generic, not reflecting `kind`/`id` back - both come straight from the URL path.
		res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
		res.end('Not found - this row has no report of that kind.')
		return true
	}
	const base = path.join(ROOT, baseRel)
	let filePath = path.join(base, ...fileParts)
	if (fileParts.length === 0 || fileParts.at(-1) === '') {
		filePath = path.join(filePath, 'index.html')
	}
	if (!existsSync(filePath) || !statSync(filePath).isFile()) {
		res.writeHead(404, { 'Content-Type': 'text/html' })
		res.end('<p>No report yet - click Run first.</p>')
		return true
	}
	sendFile(res, filePath)
	return true
}

const ROUTES: RouteHandler[] = [
	handleHome,
	handleRun,
	handleCoverageSummary,
	handleStatus,
	handleDocs,
	handleReports,
]

const server = http.createServer((req, res) => {
	const url = new URL(req.url ?? '/', `http://localhost:${PORT}`)
	const handled = ROUTES.some((route) => route(req, res, url))
	if (!handled) {
		res.writeHead(404)
		res.end()
	}
})

server.listen(PORT, () => {
	console.log(`Test dashboard: http://localhost:${PORT}`)
})
