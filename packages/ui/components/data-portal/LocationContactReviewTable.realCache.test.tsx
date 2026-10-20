import { cleanNotifications } from '@mantine/notifications'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createTRPCReact } from '@trpc/react-query'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { type AppRouter } from '@weareinreach/api'
import {
	buildTrpcTestWrapper,
	createFakeLocationContactReviewBackend,
	createMswServer,
	type FakeReviewRow,
	LOCATION,
	mockMutationFailure,
	ORG,
} from '~ui/test/trpcIntegrationHarness'

/**
 * The data managers' review list for the location-contact cleanup, on a real QueryClient with only the
 * network faked: deciding an item takes it off the list without a refresh, sends the right decision, and a
 * failed save leaves the item on the list with a visible error.
 */

vi.mock('next/router', () => ({
	useRouter: () => ({ query: {}, pathname: '/data-portal/location-phone-cleanup', push: vi.fn() }),
}))

const trpc = createTRPCReact<AppRouter>()
vi.mock('~ui/lib/trpcClient', () => ({ trpc }))

const { LocationContactReviewTable } = await import('./LocationContactReviewTable')

let backend: ReturnType<typeof createFakeLocationContactReviewBackend>
const server = createMswServer([])

const org = {
	id: ORG.id,
	name: 'Los Angeles LGBT Center',
	slug: ORG.slug,
	locationCount: 5,
	mainPageHasPhone: false,
}
const phoneRow: FakeReviewRow = {
	type: 'phone',
	id: 'ophn_review_1',
	value: '3232867224',
	showOnOrgPage: false,
	org,
	locations: [{ id: LOCATION.id, name: 'Mi Centro' }],
}
const emailRow: FakeReviewRow = {
	type: 'email',
	id: 'oeml_review_1',
	value: 'info@example.org',
	showOnOrgPage: true,
	org,
	locations: [{ id: LOCATION.id, name: 'Mi Centro' }],
}

beforeAll(() => {
	server.listen({ onUnhandledRequest: 'error' })
})
beforeEach(() => {
	backend = createFakeLocationContactReviewBackend()
	backend.seedRow(phoneRow)
	backend.seedRow(emailRow)
	server.resetHandlers(...backend.handlers)
	cleanNotifications()
})
afterAll(() => server.close())

const renderTable = () => {
	const { Wrapper } = buildTrpcTestWrapper(trpc)
	return render(<LocationContactReviewTable />, { wrapper: Wrapper })
}

const rowFor = async (text: string, options?: { exact: boolean }) => {
	const cell = await screen.findByText(text, options)
	const row = cell.closest('tr')
	if (!row) {
		throw new Error(`no table row for ${text}`)
	}
	return within(row)
}

describe('LocationContactReviewTable - real cache', () => {
	it("groups items under their organization's row, which has the Edit link", async () => {
		renderTable()

		const orgRow = await rowFor('Los Angeles LGBT Center (2)', { exact: false })
		expect(orgRow.getByText('· main page has no phone number')).toBeInTheDocument()
		expect(orgRow.getByRole('link', { name: 'Edit' })).toHaveAttribute(
			'href',
			expect.stringContaining('edit')
		)
		expect(orgRow.queryByRole('button', { name: 'Location(s) only' })).not.toBeInTheDocument()

		// Item rows: the three choices, and where each shows today. Undecided phones are hidden from the org
		// page until someone decides.
		const phone = await rowFor('3232867224')
		expect(phone.getByRole('button', { name: 'Location(s) only' })).toBeInTheDocument()
		expect(phone.queryByRole('link', { name: 'Edit' })).not.toBeInTheDocument()
		expect(phone.getByText('Only "Mi Centro" location')).toBeInTheDocument()
		expect(
			(await rowFor('info@example.org')).getByText('Organization page and "Mi Centro" location')
		).toBeInTheDocument()
		expect(screen.getByText(/Left to review \(1 organizations\): 2 \(items\)/)).toBeInTheDocument()
	})

	it('search shows only the matching items, under their organization', async () => {
		renderTable()
		await rowFor('3232867224')

		await userEvent.type(screen.getByPlaceholderText(/search organizations/i), 'info@')

		await waitFor(() => expect(screen.queryByText('3232867224')).not.toBeInTheDocument())
		expect(screen.getByText('Los Angeles LGBT Center (1)', { exact: false })).toBeInTheDocument()
		expect(screen.getByText('info@example.org')).toBeInTheDocument()
	})

	it.each([
		['Organization page only', 'orgOnly'],
		['Organization page and location(s)', 'orgAndLocations'],
		['Location(s) only', 'locationsOnly'],
	] as const)(
		'"%s" sends that choice and takes the row off the list without a refresh',
		async (label, choice) => {
			renderTable()

			const phone = await rowFor('3232867224')
			await userEvent.click(phone.getByRole('button', { name: label }))

			await waitFor(() => expect(screen.queryByText('3232867224')).not.toBeInTheDocument())
			expect(backend.decisions).toEqual([{ type: 'phone', id: phoneRow.id, choice }])
			expect(screen.getByText('info@example.org')).toBeInTheDocument()
		}
	)

	it('"Organization page only" on a phone clears the organization\'s "main page has no phone number" note', async () => {
		renderTable()
		await rowFor('· main page has no phone number')

		await userEvent.click(
			(await rowFor('3232867224')).getByRole('button', { name: 'Organization page only' })
		)

		await waitFor(() => expect(screen.queryByText('3232867224')).not.toBeInTheDocument())
		expect(screen.queryByText('· main page has no phone number')).not.toBeInTheDocument()
		expect(screen.getByText('info@example.org')).toBeInTheDocument()
	})

	it('a failed save keeps the row on the list and shows an error', async () => {
		renderTable()
		const phone = await rowFor('3232867224')
		server.use(mockMutationFailure('locationContactReview.decide'))

		await userEvent.click(phone.getByRole('button', { name: 'Location(s) only' }))

		await screen.findByText(/something went wrong saving this decision/i)
		expect(screen.getByText('3232867224')).toBeInTheDocument()
		expect(backend.decisions).toEqual([])
	})
})
