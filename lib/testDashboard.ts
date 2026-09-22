import { type ChildProcess, spawn } from 'child_process'
import { createReadStream, existsSync, statSync } from 'fs'
import http from 'http'
import path from 'path'
import { fileURLToPath } from 'url'

/**
 * Local test dashboard: one page, organized by feature area (not package), with a Run button per row that
 * actually triggers the suite and live-updates once it's done. Vitest/Playwright each write their
 * HTML+coverage reports to one fixed directory per config - rows sharing a package (packages/ui's "general"
 * vs "data-portal" subsets) use `--outputFile.html`/ `--coverage.reportsDirectory` (Vitest) or
 * `PLAYWRIGHT_HTML_REPORT` (Playwright) to give each row its own isolated report directory, so running one
 * row never clobbers another's results.
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
}

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
]

type RunState = {
	running: boolean
	lastExitCode: number | null
	lastRunAt: string | null
	lastOutputTail: string
}

const state = new Map<string, RunState>(
	ROWS.map((r) => [r.id, { running: false, lastExitCode: null, lastRunAt: null, lastOutputTail: '' }])
)
const procs = new Map<string, ChildProcess>()

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

const runRow = (row: Row) => {
	const st = state.get(row.id)
	if (!st || st.running) return
	st.running = true
	st.lastOutputTail = ''
	const child = spawn(row.cmd, row.args, {
		cwd: path.join(ROOT, row.cwd),
		env: { ...process.env, ...row.env },
		shell: false,
	})
	procs.set(row.id, child)
	const capture = (chunk: Buffer) => {
		st.lastOutputTail = (st.lastOutputTail + chunk.toString()).slice(-4000)
	}
	child.stdout?.on('data', capture)
	child.stderr?.on('data', capture)
	child.on('close', (code) => {
		st.running = false
		st.lastExitCode = code
		st.lastRunAt = new Date().toISOString()
		procs.delete(row.id)
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
	.note { color: #666; font-size: .85rem; }
</style>
</head>
<body>
<h1>Test Dashboard</h1>
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
	}
}
${ROWS.map((r) => `poll('${r.id}')`).join('\n')}
</script>
</body>
</html>`
}

const server = http.createServer((req, res) => {
	const url = new URL(req.url ?? '/', `http://localhost:${PORT}`)

	if (url.pathname === '/') {
		res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
		res.end(renderPage())
		return
	}

	if (url.pathname.startsWith('/run/') && req.method === 'POST') {
		const id = url.pathname.slice('/run/'.length)
		const row = ROWS.find((r) => r.id === id)
		if (!row) {
			res.writeHead(404)
			res.end()
			return
		}
		runRow(row)
		res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
		res.end(JSON.stringify({ started: true }))
		return
	}

	if (url.pathname.startsWith('/status/')) {
		const id = url.pathname.slice('/status/'.length)
		const st = state.get(id)
		res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
		res.end(JSON.stringify(st ?? { running: false, lastExitCode: null, lastRunAt: null }))
		return
	}

	if (url.pathname.startsWith('/reports/')) {
		const rest = url.pathname.slice('/reports/'.length) // "<rowId>/<results|coverage>/..."
		const [id, kind, ...fileParts] = rest.split('/')
		const row = ROWS.find((r) => r.id === id)
		const baseRel = kind === 'coverage' ? row?.coverage : row?.results
		if (!row || !baseRel) {
			res.writeHead(404)
			res.end('Not found - this row has no ' + kind + ' report.')
			return
		}
		const base = path.join(ROOT, baseRel)
		let filePath = path.join(base, ...fileParts)
		if (fileParts.length === 0 || fileParts[fileParts.length - 1] === '') {
			filePath = path.join(filePath, 'index.html')
		}
		if (!existsSync(filePath) || !statSync(filePath).isFile()) {
			res.writeHead(404, { 'Content-Type': 'text/html' })
			res.end('<p>No report yet - click Run first.</p>')
			return
		}
		sendFile(res, filePath)
		return
	}

	res.writeHead(404)
	res.end()
})

server.listen(PORT, () => {
	console.log(`Test dashboard: http://localhost:${PORT}`)
})
