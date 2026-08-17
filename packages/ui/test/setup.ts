import '@testing-library/jest-dom/vitest'

import { vi } from 'vitest'

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
