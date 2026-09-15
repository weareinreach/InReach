import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { render, screen } from '~ui/test/test-utils'

import { ReportSubmit } from './ReportSubmit'

vi.mock('next-auth/react', () => ({
	useSession: vi.fn(),
}))

vi.mock('~ui/lib/trpcClient', () => ({
	trpc: {
		report: {
			create: { useMutation: vi.fn() },
		},
	},
}))

const { trpc } = await import('~ui/lib/trpcClient')
const { useSession } = await import('next-auth/react')
const useCreateReportMock = vi.mocked(trpc.report.create.useMutation)
const useSessionMock = vi.mocked(useSession)

describe('ReportSubmit', () => {
	it('sets spellCheck on the free-text note field once an issue type reveals it', async () => {
		useSessionMock.mockReturnValue({ data: null, status: 'unauthenticated' } as never)
		useCreateReportMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)

		const user = userEvent.setup()
		render(<ReportSubmit itemId='org_1' itemName='Legal Aid Clinic' />)

		await user.click(screen.getByLabelText('Something else'))

		expect(screen.getByLabelText(/add a note/i)).toHaveAttribute('spellcheck', 'true')
	})
})
