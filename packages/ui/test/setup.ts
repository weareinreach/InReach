/* eslint-disable node/no-process-env */
import '@testing-library/jest-dom/vitest'

import { getIcons } from '@iconify/utils'
import { _api, addCollection } from '@iconify-icon/react'
import { icons as carbonIcons } from '@iconify-json/carbon'
import { icons as fluentIcons } from '@iconify-json/fluent-mdl2'
import { icons as mdiIcons } from '@iconify-json/mdi'
import { icons as phIcons } from '@iconify-json/ph'
import { icons as simpleIcons } from '@iconify-json/simple-icons'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// `<Icon>` (iconify-icon) has no icon data registered under test, so every icon it renders is fetched
// from api.iconify.design and drawn from a later `setTimeout`. When that response lands after a test
// file's jsdom has been torn down, the draw throws `ReferenceError: document is not defined` as an
// unhandled error - which fails the whole CI run even with every test passing (seen on #2130). Register
// the same icon set `icon/iconCollection.ts` defines (which `iconList.ts`, and so `validateIcon`, is
// generated from) so every icon resolves synchronously, and refuse network fetches outright so a test
// can never depend on, or be slowed by, the real Iconify API.
addCollection(carbonIcons)
for (const subset of [
	getIcons(simpleIcons, ['tiktok']),
	getIcons(phIcons, ['map-pin-fill']),
	getIcons(mdiIcons, ['map-marker', 'content-save']),
	getIcons(fluentIcons, ['remove-from-trash']),
]) {
	if (subset !== null) addCollection(subset)
}
_api.setFetch(((input: RequestInfo | URL) =>
	Promise.reject(
		new Error(`Network access is disabled in tests (iconify fetch: ${String(input)})`)
	)) as typeof fetch)

// Testing Library's auto-cleanup between tests relies on detecting a *global* afterEach - this
// project's vitest config sets `globals: false`, so that auto-detection never fires and every
// test's rendered DOM silently accumulates across the whole file unless cleaned up explicitly here.
afterEach(cleanup)

// @weareinreach/env validates real client env vars (e.g. NEXT_PUBLIC_GOOGLE_MAPS_API) at import
// time - components that transitively pull it in (anything importing ~ui/components/core/ActionButtons,
// even just for its types) crash under test with no real .env available. Storybook's own config
// (.storybook/main.ts) sets this same flag for the identical reason; tests need it too.
process.env.SKIP_ENV_VALIDATION = 'true'

// jsdom doesn't implement matchMedia - Mantine's responsive hooks (e.g. Tooltip's
// useMediaQuery) call it internally, so it needs a stub for any component using them.
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation((query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
})

// jsdom doesn't implement ResizeObserver - Mantine's ScrollArea (used internally by Select, Modal,
// and other overlay-bearing components) calls it on mount.
class MockResizeObserver {
	observe = vi.fn()
	unobserve = vi.fn()
	disconnect = vi.fn()
}
Object.defineProperty(window, 'ResizeObserver', { writable: true, value: MockResizeObserver })

// jsdom doesn't implement scrollIntoView - Mantine's Combobox (used by Select and friends) calls it on
// the active option after selection, on a timer that can fire after a test has already finished and
// torn down its render, surfacing as an unhandled exception rather than a normal assertion failure.
Object.defineProperty(window.Element.prototype, 'scrollIntoView', { writable: true, value: vi.fn() })
