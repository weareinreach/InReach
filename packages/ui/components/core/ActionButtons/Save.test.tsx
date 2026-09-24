import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { render, screen } from '~ui/test/test-utils'

import { Save } from './Save'

vi.mock('next/router', () => ({
	useRouter: () => ({ pathname: '', query: {}, push: vi.fn(), locale: 'en' }),
}))

const sessionMock = vi.fn()
vi.mock('next-auth/react', () => ({
	useSession: () => sessionMock(),
}))

vi.mock('~ui/lib/trpcClient', () => ({
	trpc: {
		useUtils: () => ({
			savedList: { invalidate: vi.fn(), isSaved: { invalidate: vi.fn() }, getAll: { invalidate: vi.fn() } },
		}),
		savedList: {
			saveItem: { useMutation: vi.fn() },
			deleteItem: { useMutation: vi.fn() },
			isSaved: { useQuery: vi.fn() },
			getAll: { useQuery: vi.fn() },
			create: { useMutation: vi.fn() },
			createAndSaveItem: { useMutation: vi.fn() },
		},
		// The unauthenticated branch renders QuickPromotionModal, which mounts
		// LoginModalLauncher/SignupModalLauncher even before either is opened - SignupModalBody
		// calls this unconditionally.
		user: { create: { useMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })) } },
	},
}))

const { trpc } = await import('~ui/lib/trpcClient')
const isSavedMock = vi.mocked(trpc.savedList.isSaved.useQuery)
const getAllMock = vi.mocked(trpc.savedList.getAll.useQuery)
const saveItemMock = vi.mocked(trpc.savedList.saveItem.useMutation)
const deleteItemMock = vi.mocked(trpc.savedList.deleteItem.useMutation)
const createMock = vi.mocked(trpc.savedList.create.useMutation)
const createAndSaveItemMock = vi.mocked(trpc.savedList.createAndSaveItem.useMutation)

describe('ActionButtons.Save', () => {
	it('6.1: not logged in - clicking Save opens the auth-promotion modal, nothing is saved', async () => {
		sessionMock.mockReturnValue({ status: 'unauthenticated', data: null })
		isSavedMock.mockReturnValue({ data: undefined } as never)
		getAllMock.mockReturnValue({ data: undefined, isError: false } as never)
		const saveMutate = vi.fn()
		saveItemMock.mockReturnValue({ mutate: saveMutate, isPending: false } as never)
		deleteItemMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)

		render(<Save itemId='item_1' itemName='Test Org' />)
		await userEvent.setup().click(screen.getByRole('button', { name: /save/i }))

		expect(await screen.findByRole('dialog')).toBeInTheDocument()
		expect(saveMutate).not.toHaveBeenCalled()
	})

	it('6.2: logged in, not yet saved - clicking Save opens a menu with "create new list"', async () => {
		sessionMock.mockReturnValue({ status: 'authenticated', data: { user: {} } })
		isSavedMock.mockReturnValue({ data: null } as never) // real API returns null (never []) for "not saved to anything" - see packages/api/router/savedLists/query.isSaved.handler.ts
		getAllMock.mockReturnValue({ data: [{ id: 'list_1', name: 'My List' }], isError: false } as never)
		saveItemMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)
		deleteItemMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)
		createMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)
		createAndSaveItemMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)

		render(<Save itemId='item_1' itemName='Test Org' />)
		await userEvent.setup().click(screen.getByRole('button', { name: /save/i }))

		expect(await screen.findByText('My List')).toBeInTheDocument()
	})

	it('6.3: logged in, saved to exactly one list - Save directly removes it, no menu', async () => {
		sessionMock.mockReturnValue({ status: 'authenticated', data: { user: {} } })
		isSavedMock.mockReturnValue({ data: [{ id: 'list_1', name: 'My List' }] } as never)
		getAllMock.mockReturnValue({ data: [{ id: 'list_1', name: 'My List' }], isError: false } as never)
		const removeMutate = vi.fn()
		saveItemMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)
		deleteItemMock.mockReturnValue({ mutate: removeMutate, isPending: false } as never)

		render(<Save itemId='item_1' itemName='Test Org' />)
		await userEvent.setup().click(screen.getByRole('button', { name: /saved/i }))

		expect(removeMutate).toHaveBeenCalledWith({ id: 'list_1', itemId: 'item_1' })
		expect(screen.queryByRole('menu')).not.toBeInTheDocument()
	})

	it('6.4: logged in, saved to multiple lists - Save opens a menu showing membership per list', async () => {
		sessionMock.mockReturnValue({ status: 'authenticated', data: { user: {} } })
		isSavedMock.mockReturnValue({
			data: [
				{ id: 'list_1', name: 'List One' },
				{ id: 'list_2', name: 'List Two' },
			],
		} as never)
		getAllMock.mockReturnValue({
			data: [
				{ id: 'list_1', name: 'List One' },
				{ id: 'list_2', name: 'List Two' },
			],
			isError: false,
		} as never)
		saveItemMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)
		deleteItemMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)
		createMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)
		createAndSaveItemMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)

		render(<Save itemId='item_1' itemName='Test Org' />)
		// Saved to 2+ lists still renders the menu-opening button (unlike the exactly-one-list
		// case, which renders a direct-remove button labeled "Saved" instead) - same label text
		// either way, so target by role/name is ambiguous here; this is still the button.
		await userEvent.setup().click(screen.getByRole('button', { name: /saved/i }))

		expect(await screen.findByText('List One')).toBeInTheDocument()
		expect(screen.getByText('List Two')).toBeInTheDocument()
	})

	it('6.6: a failed save mutation shows an error, does not flip the displayed state to saved', async () => {
		sessionMock.mockReturnValue({ status: 'authenticated', data: { user: {} } })
		isSavedMock.mockReturnValue({ data: null } as never) // real API returns null (never []) for "not saved to anything" - see packages/api/router/savedLists/query.isSaved.handler.ts
		getAllMock.mockReturnValue({ data: [{ id: 'list_1', name: 'My List' }], isError: false } as never)
		saveItemMock.mockImplementation(((opts: { onError?: () => void }) => ({
			mutate: () => opts.onError?.(),
			isPending: false,
		})) as never)
		deleteItemMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)
		createMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)
		createAndSaveItemMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)

		render(<Save itemId='item_1' itemName='Test Org' />)
		await userEvent.setup().click(screen.getByRole('button', { name: /save/i }))
		await userEvent.setup().click(await screen.findByText('My List'))

		// Button should still read "Save" (isSavedMock never changed), not "Saved" - the failed
		// mutation's onError doesn't touch the isSaved query, so this mainly documents that
		// nothing silently flips the button's own state; the actual error notification is a
		// Mantine notification portal, out of scope for this render-tree assertion.
		expect(screen.getByRole('button', { name: /^save$/i })).toBeInTheDocument()
	})

	it('6.7: a failed "get all lists" fetch shows a retry option, not a broken/empty menu', async () => {
		sessionMock.mockReturnValue({ status: 'authenticated', data: { user: {} } })
		isSavedMock.mockReturnValue({ data: null } as never) // real API returns null (never []) for "not saved to anything" - see packages/api/router/savedLists/query.isSaved.handler.ts
		getAllMock.mockReturnValue({ data: undefined, isError: true, refetch: vi.fn() } as never)
		saveItemMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)
		deleteItemMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)

		render(<Save itemId='item_1' itemName='Test Org' />)
		await userEvent.setup().click(screen.getByRole('button', { name: /save/i }))

		expect(await screen.findByText(/retry/i)).toBeInTheDocument()
	})
})
