import { cleanNotifications } from '@mantine/notifications'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createTRPCReact } from '@trpc/react-query'
import { http, HttpResponse } from 'msw'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { type AppRouter } from '@weareinreach/api'
import {
	buildTrpcTestWrapper,
	createFakeOrgWebsiteBackend,
	createMswServer,
	LOCATION,
	ORG,
} from '~ui/test/trpcIntegrationHarness'

/**
 * Real-cache regression coverage for the contact-info "manual refresh" bug, mirroring
 * PhoneNumbers.realCache.test.tsx / Emails.realCache.test.tsx: save it, see it without refreshing, and reopen
 * it to see the latest saved state. Renders the real `Websites` (edit mode) together with the real
 * `WebsiteDrawer`s it mounts per row, backed by one real `QueryClient` and a real `trpc.Provider`, with only
 * the network boundary faked.
 */

vi.mock('next/router', () => ({
	useRouter: () => ({ query: { slug: ORG.slug }, pathname: '', push: vi.fn() }),
}))

vi.mock('~ui/hooks/useOrgInfo', () => ({
	useOrgInfo: () => ({ id: ORG.id, slug: ORG.slug }),
}))

const trpc = createTRPCReact<AppRouter>()
vi.mock('~ui/lib/trpcClient', () => ({ trpc }))

const { Websites } = await import('./Websites')

let backend: ReturnType<typeof createFakeOrgWebsiteBackend>
const server = createMswServer([])

let forEditDrawerRequestCount = 0

beforeAll(() => {
	server.listen({ onUnhandledRequest: 'error' })
	server.events.on('request:start', ({ request }) => {
		if (request.url.includes('orgWebsite.forEditDrawer')) {
			forEditDrawerRequestCount += 1
		}
	})
})
beforeEach(() => {
	backend = createFakeOrgWebsiteBackend()
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
	const view = render(<Websites edit parentId={ORG.id} />, { wrapper: Wrapper })
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

// See Emails.realCache.test.tsx for why role-based queries (not getByLabelText) are required here -
// `WebsitesEdit` keeps every row's own (closed) `WebsiteDrawer` mounted, and only role queries
// correctly exclude those from matching.
const urlField = () => screen.getByRole('textbox', { name: /website url/i })

describe('Websites + WebsiteDrawer - real cache: create, save, see it without refreshing', () => {
	it('shows the new website in the list immediately, then opens with the same values (not blank)', async () => {
		renderList()
		await screen.findByText(/create new/i)

		await openDrawerFor(/create new/i)
		await userEvent.type(urlField(), 'https://new-site.example.org')

		await clickSave()
		await waitFor(() => expect(screen.queryByRole('heading', { name: /Add New/ })).not.toBeInTheDocument())

		// Contract 1: the list reflects the newly created website without any refresh.
		await screen.findByText(/new-site\.example\.org/)

		// Contract 2: opening that same new website from the list shows what was actually saved.
		await openDrawerFor(/new-site\.example\.org/)
		await waitFor(() => {
			expect(urlField()).toHaveValue('https://new-site.example.org')
		})
	})
})

describe('Websites + WebsiteDrawer - real cache: edit, save, reopen shows the latest', () => {
	it('reflects each successive edit in both the list and the reopened form, never reverting to an earlier value', async () => {
		backend.seedOrgWebsite({ url: 'https://original.example.org', published: true })
		renderList()

		await openDrawerFor(/original\.example\.org/)
		await waitFor(() => {
			expect(urlField()).toHaveValue('https://original.example.org')
		})

		// Edit 1: change the URL itself.
		await userEvent.clear(urlField())
		await userEvent.type(urlField(), 'https://updated.example.org')
		await clickSave()
		await waitFor(() => expect(screen.queryByRole('heading', { name: /Edit/ })).not.toBeInTheDocument())

		// Contract 1, edit 1: list shows the new URL without a refresh; the old one is gone.
		await screen.findByText(/updated\.example\.org/)
		expect(screen.queryByText(/original\.example\.org/)).not.toBeInTheDocument()

		// Contract 2, edit 1: reopening shows the new URL, not the original.
		await openDrawerFor(/updated\.example\.org/)
		await waitFor(() => {
			expect(urlField()).toHaveValue('https://updated.example.org')
		})

		// Edit 2, on the same record: unpublish it.
		await userEvent.click(screen.getByRole('checkbox', { name: /published/i }))
		await clickSave()
		await waitFor(() => expect(screen.queryByRole('heading', { name: /Edit/ })).not.toBeInTheDocument())

		// Contract 1, edit 2: list still shows the URL from edit 1, now unpublished - the two edits
		// must compound, not overwrite each other.
		await screen.findByText(/updated\.example\.org/)

		// Contract 2, edit 2: reopening shows BOTH edits - the new URL AND unpublished.
		await openDrawerFor(/updated\.example\.org/)
		await waitFor(() => {
			expect(urlField()).toHaveValue('https://updated.example.org')
		})
		expect(screen.getByRole('checkbox', { name: /published/i })).not.toBeChecked()
	})
})

describe('Websites + WebsiteDrawer - real cache: reopening after a save does not refetch', () => {
	/**
	 * Direct regression test for a live report: create a website unpublished, open it and check Published (save
	 * succeeds), reopen it a third time - Published showed unchecked again, and a hard refresh made the website
	 * disappear then reappear. Root cause: `onSettled` used to mark `forEditDrawer` stale (`invalidate(...,
	 * {refetchType:'none'})`) right after patching it - that doesn't refetch immediately, but the _next_ time
	 * this same query re-enables (exactly what reopening this same drawer does, since it's gated by `enabled:
	 * drawerOpened`), react-query auto-refetches because the data is stale, reading from a database confirmed
	 * elsewhere in this codebase to lag behind its own writes - silently overwriting the just-patched, correct
	 * value with a stale one. This test can't reproduce the lag itself (the fake backend has none), but it
	 * proves the _mechanism_ is gone: reopening after a save must not issue a network request at all, only the
	 * very first open of a given item should.
	 */
	it('does not issue a second forEditDrawer request when reopening the same item after a save', async () => {
		backend.seedOrgWebsite({ url: 'https://no-refetch.example.org', published: false })
		renderList()

		await openDrawerFor(/no-refetch\.example\.org/)
		await waitFor(() => expect(screen.getByRole('checkbox', { name: /published/i })).not.toBeChecked())
		expect(forEditDrawerRequestCount).toBe(1)

		await userEvent.click(screen.getByRole('checkbox', { name: /published/i }))
		await clickSave()
		await waitFor(() => expect(screen.queryByRole('heading', { name: /Edit/ })).not.toBeInTheDocument())
		// The save itself never queries `forEditDrawer` (only `upsert`) - patched via `setData` alone.
		expect(forEditDrawerRequestCount).toBe(1)

		await openDrawerFor(/no-refetch\.example\.org/)
		// The reopen must be served entirely from the already-patched cache - no second network
		// round trip that could race a lagging database.
		expect(forEditDrawerRequestCount).toBe(1)
		await waitFor(() => {
			expect(screen.getByRole('checkbox', { name: /published/i })).toBeChecked()
		})
	})
})

describe('Websites + WebsiteDrawer - real cache: reusing the Create new trigger for a second item', () => {
	/**
	 * See SocialMedia.realCache.test.tsx's identical test for the full incident writeup - same mechanism, same
	 * fix, same regression coverage, for orgWebsite's `forEditDrawer`.
	 */
	it('reopening "Create new" after saving one item shows a blank form and closes normally', async () => {
		renderList()
		await screen.findByText(/create new/i)

		await openDrawerFor(/create new/i)
		await userEvent.type(urlField(), 'https://first.example.org')
		await clickSave()
		await waitFor(() => expect(screen.queryByRole('heading', { name: /Add New/ })).not.toBeInTheDocument())

		await openDrawerFor(/^create new$/i)
		await screen.findByRole('heading', { name: /Add New|Edit/ })

		// Contract 1: the reopened "Create new" form is blank, not the first item's data.
		await waitFor(() => {
			expect(urlField()).toHaveValue('')
		})

		// Contract 2: with nothing typed, the drawer is not dirty and Close actually closes it.
		await userEvent.click(screen.getByRole('button', { name: /close/i }))
		await waitFor(() => {
			expect(screen.queryByRole('heading', { name: /Add New|Edit/ })).not.toBeInTheDocument()
		})
		expect(screen.queryByText('Unsaved Changes')).not.toBeInTheDocument()
	})
})

describe('Websites + WebsiteDrawer - real cache: a failed save must not corrupt the cache', () => {
	/**
	 * See PhoneNumbers.realCache.test.tsx's identical test for the full incident writeup - same mechanism, same
	 * fix (#2087: `onError` now shows a visible warning notification, using the real `<Notifications />` portal
	 * added to the test harness for this), for orgWebsite's `upsert`.
	 */
	it('does not corrupt the list or edit, and shows a visible error, when the save fails', async () => {
		backend.seedOrgWebsite({ url: 'https://original.example.org', published: true })
		renderList()

		await openDrawerFor(/original\.example\.org/)
		await waitFor(() => expect(urlField()).toHaveValue('https://original.example.org'))

		await userEvent.clear(urlField())
		await userEvent.type(urlField(), 'https://updated.example.org')

		server.use(
			http.post('http://localhost/trpc/orgWebsite.upsert', () =>
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
		expect(urlField()).toHaveValue('https://updated.example.org')

		expect(screen.getByText(/original\.example\.org/)).toBeInTheDocument()
		expect(screen.queryByText(/updated\.example\.org/)).not.toBeInTheDocument()

		await screen.findByText(/something went wrong saving this website/i)
	})
})

describe('Websites + WebsiteDrawer - real cache: edit, discard, reopen shows the original (unedited) data', () => {
	/**
	 * See PhoneNumbers.realCache.test.tsx's identical test for the full reasoning - same verified,
	 * correct-and-worth-guarding behavior for orgWebsite.
	 */
	it('discarding an edit and reopening the same item shows the real saved data, not blank/default fields', async () => {
		backend.seedOrgWebsite({ url: 'https://original.example.org', published: true })
		renderList()

		await openDrawerFor(/original\.example\.org/)
		await waitFor(() => expect(urlField()).toHaveValue('https://original.example.org'))

		await userEvent.type(urlField(), 'xxx')

		await userEvent.click(screen.getByRole('button', { name: /close/i }))
		await screen.findByRole('dialog', { name: 'Unsaved Changes' })
		await userEvent.click(screen.getByRole('button', { name: /discard/i }))
		await waitFor(() => expect(screen.queryByText('Unsaved Changes')).not.toBeInTheDocument())
		await waitFor(() => expect(screen.queryByRole('heading', { name: /Edit/ })).not.toBeInTheDocument())

		await openDrawerFor(/original\.example\.org/)
		await waitFor(() => {
			expect(urlField()).toHaveValue('https://original.example.org')
		})
	})
})

describe('Websites + WebsiteDrawer - real cache: "Create new" from a location\'s "Link or create new..." menu', () => {
	/**
	 * Live report: from a location's edit page (`parentId` is a real `orgLocation` id, not an organization id -
	 * `isIdFor('orgLocation', parentId)` is true, so this renders the "Link or create new..." `Menu` branch,
	 * not the plain direct trigger the other tests in this file exercise), clicking "Create new" opened the
	 * drawer but nothing inside it responded to clicks - not the URL field, not even Close. Root cause: the
	 * real `WebsiteDrawer` (its own trigger button/anchor, then its portal-rendered `Drawer.Root`) was nested
	 * directly inside the `Menu.Item`, an interactive element inside another interactive element, racing
	 * Mantine's `Menu`'s own close-on-item-click handling against the newly-opened Drawer's focus trap.
	 * `PhoneNumbers.tsx` had already hit and fixed this identical bug (see its own comment on the equivalent
	 * code) - `Websites.tsx`/`Emails.tsx`/`SocialMedia.tsx` just never got the same fix. No existing test in
	 * this file (or `Emails`/`SocialMedia`'s equivalents) ever rendered with a location `parentId` at all, so
	 * this path had zero coverage.
	 */
	it('opens an interactive drawer - the URL field and Close both actually work', async () => {
		const { Wrapper } = buildTrpcTestWrapper(trpc, { strictMode: true })
		render(<Websites edit parentId={LOCATION.id} />, { wrapper: Wrapper })

		await userEvent.click(await screen.findByText(/link or create new/i))
		await userEvent.click(await screen.findByRole('menuitem', { name: /^create new$/i }))
		await screen.findByRole('heading', { name: /Add New/i })

		await userEvent.type(urlField(), 'https://new-location-site.example.org')
		await waitFor(() => expect(urlField()).toHaveValue('https://new-location-site.example.org'))

		await userEvent.click(screen.getByRole('button', { name: /close/i }))
		await screen.findByRole('dialog', { name: 'Unsaved Changes' })
		await userEvent.click(screen.getByRole('button', { name: /discard/i }))
		await waitFor(() => {
			expect(screen.queryByRole('heading', { name: /Add New/i })).not.toBeInTheDocument()
		})
	})
})
