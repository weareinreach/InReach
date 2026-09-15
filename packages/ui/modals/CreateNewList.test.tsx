import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { render, screen } from '~ui/test/test-utils'

import { CreateNewList } from './CreateNewList'

// The modal's title renders a <Breadcrumb>, which calls next/router's useRouter() - throws without
// a mounted RouterContext (nothing in this render tree provides one).
vi.mock('next/router', () => ({
	useRouter: () => ({
		pathname: '',
		query: {},
		push: vi.fn(),
	}),
}))

vi.mock('~ui/lib/trpcClient', () => ({
	trpc: {
		savedList: {
			create: { useMutation: vi.fn() },
			createAndSaveItem: { useMutation: vi.fn() },
		},
		useUtils: vi.fn(),
	},
}))

const { trpc } = await import('~ui/lib/trpcClient')
const useCreateMock = vi.mocked(trpc.savedList.create.useMutation)
const useCreateAndSaveItemMock = vi.mocked(trpc.savedList.createAndSaveItem.useMutation)
const useUtilsMock = vi.mocked(trpc.useUtils)

describe('CreateNewList', () => {
	it('sets spellCheck on the list name field', async () => {
		useCreateMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)
		useCreateAndSaveItemMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)
		useUtilsMock.mockReturnValue({
			savedList: {
				getAll: { getData: vi.fn(), setData: vi.fn(), cancel: vi.fn(), invalidate: vi.fn() },
				isSaved: { invalidate: vi.fn() },
			},
		} as never)

		const user = userEvent.setup()
		render(<CreateNewList>Create new list</CreateNewList>)
		await user.click(screen.getByRole('button', { name: 'Create new list' }))

		// Opening the modal is deferred behind a 50ms setTimeout (so it doesn't fight a parent Menu's
		// closing animation for focus) - findBy* polls past that delay instead of asserting immediately.
		// Regex, not an exact string - the field is `required`, so Mantine appends a `*` indicator to
		// the label's accessible text content ("List name *"), which an exact-string match would miss.
		expect(await screen.findByLabelText(/list name/i)).toHaveAttribute('spellcheck', 'true')
	})
})
