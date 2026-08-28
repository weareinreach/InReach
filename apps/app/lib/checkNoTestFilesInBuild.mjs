// A stray barrel export (`export * from './Rating.test'`) once let a Vitest test file get
// bundled into the real app, crashing the build with `vi.queueMock() is forbidden` (vitest's
// mocking internals only work inside its own test runner). This can only happen via an
// accidental import - e.g. a codegen-managed barrel missing a `.test.` exclude pattern - so
// scan the actual build output for that class of leak and fail loudly if it ever recurs.
//
// Bundler-agnostic on purpose: Turbopack has no compilation-hook API equivalent to webpack's
// `compilation.hooks.finishModules`, so this runs as a postbuild check over the emitted files
// instead of a bundler plugin.
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const buildDir = path.resolve(import.meta.dirname, '../.next')
// Any of these strings appearing in shipped output means a test file's source made it into
// the real bundle - none of them have a legitimate reason to exist outside a test file.
const testFileMarkers = [/from *["']vitest["']/, /require\(["']vitest["']\)/, /vi\.queueMock/]

async function* walk(dir) {
	const entries = await readdir(dir, { withFileTypes: true })
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name)
		if (entry.isDirectory()) {
			if (entry.name === 'cache') continue
			yield* walk(fullPath)
		} else if (entry.name.endsWith('.js') || entry.name.endsWith('.mjs')) {
			yield fullPath
		}
	}
}

const offenders = []
for await (const filePath of walk(buildDir)) {
	const contents = await readFile(filePath, 'utf8')
	if (testFileMarkers.some((marker) => marker.test(contents))) {
		offenders.push(filePath)
	}
}

if (offenders.length > 0) {
	console.error('Test file(s) reachable from the app bundle:')
	for (const file of offenders) console.error(`  ${file}`)
	console.error(
		'Something imports a test file, directly or via a barrel export - check for a stray ' +
			'`export * from` in a codegen-managed index file.'
	)
	process.exit(1)
}
