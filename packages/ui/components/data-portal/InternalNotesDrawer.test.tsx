import { describe, expect, it, vi } from 'vitest'

import { render, screen } from '~ui/test/test-utils'

import { InternalNotesDrawer } from './InternalNotesDrawer'

// ModalTitle -> Breadcrumb calls next/router's useRouter(), which throws without a mounted
// RouterContext (nothing in this render tree provides one) - stub it, same as any other test
// rendering a component that pulls in Breadcrumb would need to.
vi.mock('next/router', () => ({
	useRouter: () => ({
		pathname: '',
		query: {},
		push: vi.fn(),
	}),
}))

// See DuplicateServiceModal's test file for why ModalTitle is stubbed here: it transitively forms
// a circular import through the modals directory that crashes Vitest's SSR module loader when the
// generated Prisma client isn't present (as in CI). Nothing in this file asserts on ModalTitle.
vi.mock('~ui/modals/ModalTitle', () => ({
	ModalTitle: () => null,
}))

vi.mock('next-auth/react', () => ({
	useSession: vi.fn(),
}))

vi.mock('~ui/lib/trpcClient', () => ({
	trpc: {
		internalNote: {
			getAllForRecord: { useQuery: vi.fn() },
			create: { useMutation: vi.fn() },
		},
		useUtils: vi.fn(),
	},
}))

const { trpc } = await import('~ui/lib/trpcClient')
const { useSession } = await import('next-auth/react')
const useNotesQueryMock = vi.mocked(trpc.internalNote.getAllForRecord.useQuery)
const useCreateNoteMutationMock = vi.mocked(trpc.internalNote.create.useMutation)
const useUtilsMock = vi.mocked(trpc.useUtils)
const useSessionMock = vi.mocked(useSession)

describe('InternalNotesDrawer', () => {
	it('sets spellCheck on the "Add a note" field', () => {
		useSessionMock.mockReturnValue({ data: null, status: 'unauthenticated' } as never)
		useNotesQueryMock.mockReturnValue({ data: [], isLoading: false, error: null } as never)
		useCreateNoteMutationMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)
		useUtilsMock.mockReturnValue({
			internalNote: { getAllForRecord: { getData: vi.fn(), setData: vi.fn() } },
		} as never)

		render(<InternalNotesDrawer opened recordId='org_1' name='Legal Aid Clinic' onClose={() => {}} />)

		expect(screen.getByLabelText(/add a note/i)).toHaveAttribute('spellcheck', 'true')
	})
})
