/* eslint-disable node/no-process-env */
import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

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
