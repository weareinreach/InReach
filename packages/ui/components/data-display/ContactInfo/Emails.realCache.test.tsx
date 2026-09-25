import { cleanNotifications } from '@mantine/notifications'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createTRPCReact } from '@trpc/react-query'
import { http, HttpResponse } from 'msw'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { type AppRouter } from '@weareinreach/api'
import {
	buildTrpcTestWrapper,
	createFakeOrgEmailBackend,
	createMswServer,
	LOCATION,
	ORG,
} from '~ui/test/trpcIntegrationHarness'

/**
 * Real-cache regression coverage for the contact-info "manual refresh" bug reported for
 * email/website/social-media/address, mirroring PhoneNumbers.realCache.test.tsx: save it, see it without
 * refreshing, and reopen it to see the latest saved state. Renders the real `Emails` (edit mode) together
 * with the real `EmailDrawer`s it mounts per row, backed by one real `QueryClient` and a real
 * `trpc.Provider`, with only the network boundary faked.
 */

vi.mock('next/router', () => ({
	useRouter: () => ({ query: { slug: ORG.slug }, pathname: '', push: vi.fn() }),
}))

vi.mock('~ui/hooks/useOrgInfo', () => ({
	useOrgInfo: () => ({ id: ORG.id, slug: ORG.slug }),
}))

const trpc = createTRPCReact<AppRouter>()
vi.mock('~ui/lib/trpcClient', () => ({ trpc }))

const { Emails } = await import('./Emails')

let backend: ReturnType<typeof createFakeOrgEmailBackend>
const server = createMswServer([])
let forEditDrawerRequestCount = 0

beforeAll(() => {
	server.listen({ onUnhandledRequest: 'error' })
	server.events.on('request:start', ({ request }) => {
		if (request.url.includes('orgEmail.forEditDrawer')) {
			forEditDrawerRequestCount += 1
		}
	})
})
beforeEach(() => {
	backend = createFakeOrgEmailBackend()
	server.resetHandlers(...backend.handlers)
	forEditDrawerRequestCount = 0
	// `@mantine/notifications`' store is module-level global state, not scoped to any one render - a
	// "Saved" toast from an earlier test in this file stays queued and can still be on screen (or
	// pushed out of the default 5-slot `limit`) when a later test asserts on a *different*
	// notification's text.
	cleanNotifications()
})
afterAll(() => server.close())

const renderList = () => {
	const { Wrapper } = buildTrpcTestWrapper(trpc, { strictMode: true })
	const view = render(<Emails edit parentId={ORG.id} />, { wrapper: Wrapper })
	return view
}

const openDrawerFor = async (name: string | RegExp) => {
	const trigger = await screen.findByText(name)
	await userEvent.click(trigger)
	return screen.findByRole('heading', { name: /Add New|Edit/ })
}

const clickSave = async () => {
	await waitFor(() => {
		expect(screen.getByRole('button', { name: /^Save$/ })).toBeEnabled()
	})
	await userEvent.click(screen.getByRole('button', { name: /^Save$/ }))
}

// `EmailsEdit` renders every row's own `EmailDrawer`, each `keepMounted` - closed ones stay in the DOM
// (CSS `display: none`) rather than unmounting. `getByRole` correctly excludes those from the
// accessibility tree, but `getByLabelText` is a plain DOM/label query that doesn't - with more than
// one email on screen it matches every one of their "Email" fields at once, not just the open drawer's.
// Role-based queries throughout keep every assertion scoped to whichever drawer is actually visible.
const emailField = () => screen.getByRole('textbox', { name: /email/i })

describe('Emails + EmailDrawer - real cache: create, save, see it without refreshing', () => {
	it('shows the new email in the list immediately, then opens with the same values (not blank)', async () => {
		renderList()
		await screen.findByText(/create new/i)

		await openDrawerFor(/create new/i)
		await userEvent.type(emailField(), 'new-contact@example.org')

		await clickSave()
		await waitFor(() => expect(screen.queryByRole('heading', { name: /Add New/ })).not.toBeInTheDocument())

		// Contract 1: the list reflects the newly created email without any refresh.
		await screen.findByText('new-contact@example.org')

		// Contract 2: opening that same new email from the list shows what was actually saved.
		await openDrawerFor('new-contact@example.org')
		await waitFor(() => {
			expect(emailField()).toHaveValue('new-contact@example.org')
		})
	})
})

describe('Emails + EmailDrawer - real cache: edit, save, reopen shows the latest', () => {
	it('reflects each successive edit in both the list and the reopened form, never reverting to an earlier value', async () => {
		backend.seedOrgEmail({ email: 'original@example.org', published: true })
		renderList()

		await openDrawerFor('original@example.org')
		await waitFor(() => {
			expect(emailField()).toHaveValue('original@example.org')
		})

		// Edit 1: change the email address itself.
		await userEvent.clear(emailField())
		await userEvent.type(emailField(), 'updated@example.org')
		await clickSave()
		await waitFor(() => expect(screen.queryByRole('heading', { name: /Edit/ })).not.toBeInTheDocument())

		// Contract 1, edit 1: list shows the new address without a refresh; the old one is gone.
		await screen.findByText('updated@example.org')
		expect(screen.queryByText('original@example.org')).not.toBeInTheDocument()

		// Contract 2, edit 1: reopening shows the new address, not the original.
		await openDrawerFor('updated@example.org')
		await waitFor(() => {
			expect(emailField()).toHaveValue('updated@example.org')
		})

		// Edit 2, on the same record: unpublish it.
		await userEvent.click(screen.getByRole('checkbox', { name: /published/i }))
		await clickSave()
		await waitFor(() => expect(screen.queryByRole('heading', { name: /Edit/ })).not.toBeInTheDocument())

		// Contract 1, edit 2: list still shows the address from edit 1, now unpublished - the two
		// edits must compound, not overwrite each other.
		await screen.findByText('updated@example.org')

		// Contract 2, edit 2: reopening shows BOTH edits - the new address AND unpublished.
		await openDrawerFor('updated@example.org')
		await waitFor(() => {
			expect(emailField()).toHaveValue('updated@example.org')
		})
		expect(screen.getByRole('checkbox', { name: /published/i })).not.toBeChecked()
	})
})

describe('Emails + EmailDrawer - real cache: reopening after a save does not refetch', () => {
	/**
	 * See Websites.realCache.test.tsx's identical test for the full incident writeup - same mechanism, same
	 * fix, same regression coverage, for orgEmail's `forEditDrawer`.
	 */
	it('does not issue a second forEditDrawer request when reopening the same item after a save', async () => {
		backend.seedOrgEmail({ email: 'no-refetch@example.org', published: false })
		renderList()

		await openDrawerFor('no-refetch@example.org')
		await waitFor(() => expect(screen.getByRole('checkbox', { name: /published/i })).not.toBeChecked())
		expect(forEditDrawerRequestCount).toBe(1)

		await userEvent.click(screen.getByRole('checkbox', { name: /published/i }))
		await clickSave()
		await waitFor(() => expect(screen.queryByRole('heading', { name: /Edit/ })).not.toBeInTheDocument())
		expect(forEditDrawerRequestCount).toBe(1)

		await openDrawerFor('no-refetch@example.org')
		expect(forEditDrawerRequestCount).toBe(1)
		await waitFor(() => {
			expect(screen.getByRole('checkbox', { name: /published/i })).toBeChecked()
		})
	})
})

describe('Emails + EmailDrawer - real cache: reusing the Create new trigger for a second item', () => {
	/**
	 * See SocialMedia.realCache.test.tsx's identical test for the full incident writeup - same mechanism, same
	 * fix, same regression coverage, for orgEmail's `forEditDrawer`.
	 */
	it('reopening "Create new" after saving one item shows a blank form and closes normally', async () => {
		renderList()
		await screen.findByText(/create new/i)

		await openDrawerFor(/create new/i)
		await userEvent.type(emailField(), 'first@example.org')
		await clickSave()
		await waitFor(() => expect(screen.queryByRole('heading', { name: /Add New/ })).not.toBeInTheDocument())

		await openDrawerFor(/^create new$/i)
		await screen.findByRole('heading', { name: /Add New|Edit/ })

		// Contract 1: the reopened "Create new" form is blank, not the first item's data.
		await waitFor(() => {
			expect(emailField()).toHaveValue('')
		})

		// Contract 2: with nothing typed, the drawer is not dirty and Close actually closes it.
		await userEvent.click(screen.getByRole('button', { name: /close/i }))
		await waitFor(() => {
			expect(screen.queryByRole('heading', { name: /Add New|Edit/ })).not.toBeInTheDocument()
		})
		expect(screen.queryByText('Unsaved Changes')).not.toBeInTheDocument()
	})
})

describe('Emails + EmailDrawer - real cache: a failed save must not corrupt the cache', () => {
	/**
	 * See PhoneNumbers.realCache.test.tsx's identical test for the full incident writeup - same mechanism, same
	 * fix (#2087: `onError` now shows a visible warning notification, using the real `<Notifications />` portal
	 * added to the test harness for this), for orgEmail's `update`.
	 */
	it('does not corrupt the list or edit, and shows a visible error, when the save fails', async () => {
		backend.seedOrgEmail({ email: 'original@example.org', published: true })
		renderList()

		await openDrawerFor('original@example.org')
		await waitFor(() => expect(emailField()).toHaveValue('original@example.org'))

		await userEvent.clear(emailField())
		await userEvent.type(emailField(), 'updated@example.org')

		server.use(
			http.post('http://localhost/trpc/orgEmail.update', () =>
				HttpResponse.json(
					{
						error: {
							message: 'Simulated server failure',
							code: -32603,
							data: { code: 'INTERNAL_SERVER_ERROR', httpStatus: 500 },
						},
					},
					{ status: 500 }
				)
			)
		)

		await clickSave()

		await waitFor(() => expect(screen.getByRole('button', { name: /^Save$/ })).toBeEnabled())
		expect(screen.getByRole('heading', { name: /Edit/ })).toBeInTheDocument()
		expect(emailField()).toHaveValue('updated@example.org')

		expect(screen.getByText('original@example.org')).toBeInTheDocument()
		expect(screen.queryByText('updated@example.org')).not.toBeInTheDocument()

		await screen.findByText(/something went wrong saving this email/i)
	})
})

describe('Emails + EmailDrawer - real cache: edit, discard, reopen shows the original (unedited) data', () => {
	/**
	 * See PhoneNumbers.realCache.test.tsx's identical test for the full reasoning - same verified,
	 * correct-and-worth-guarding behavior for orgEmail.
	 */
	it('discarding an edit and reopening the same item shows the real saved data, not blank/default fields', async () => {
		backend.seedOrgEmail({ email: 'original@example.org', published: true })
		renderList()

		await openDrawerFor('original@example.org')
		await waitFor(() => expect(emailField()).toHaveValue('original@example.org'))

		await userEvent.type(emailField(), 'xxx')

		await userEvent.click(screen.getByRole('button', { name: /close/i }))
		await screen.findByRole('dialog', { name: 'Unsaved Changes' })
		await userEvent.click(screen.getByRole('button', { name: /discard/i }))
		await waitFor(() => expect(screen.queryByText('Unsaved Changes')).not.toBeInTheDocument())
		await waitFor(() => expect(screen.queryByRole('heading', { name: /Edit/ })).not.toBeInTheDocument())

		await openDrawerFor('original@example.org')
		await waitFor(() => {
			expect(emailField()).toHaveValue('original@example.org')
		})
	})
})

describe('Emails + EmailDrawer - real cache: "Create new" from a location\'s "Link or create new..." menu', () => {
	/**
	 * See Websites.realCache.test.tsx's identical test for the full incident writeup - same mechanism, same fix
	 * (a real `EmailDrawer` was nested directly inside a `Menu.Item`, racing Mantine's `Menu` close-on-
	 * item-click against the Drawer's own focus trap - PhoneNumbers.tsx already had the fix this file's
	 * `Emails.tsx` never got), for orgEmail.
	 */
	it('opens an interactive drawer - the email field and Close both actually work', async () => {
		const { Wrapper } = buildTrpcTestWrapper(trpc, { strictMode: true })
		render(<Emails edit parentId={LOCATION.id} />, { wrapper: Wrapper })

		await userEvent.click(await screen.findByText(/link or create new/i))
		await userEvent.click(await screen.findByRole('menuitem', { name: /^create new$/i }))
		await screen.findByRole('heading', { name: /Add New/i })

		await userEvent.type(emailField(), 'new-location-contact@example.org')
		await waitFor(() => expect(emailField()).toHaveValue('new-location-contact@example.org'))

		await userEvent.click(screen.getByRole('button', { name: /close/i }))
		await screen.findByRole('dialog', { name: 'Unsaved Changes' })
		await userEvent.click(screen.getByRole('button', { name: /discard/i }))
		await waitFor(() => {
			expect(screen.queryByRole('heading', { name: /Add New/i })).not.toBeInTheDocument()
		})
	})
})
