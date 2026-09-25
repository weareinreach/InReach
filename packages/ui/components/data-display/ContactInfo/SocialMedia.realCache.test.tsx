import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createTRPCReact } from '@trpc/react-query'
import { http, HttpResponse } from 'msw'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { type AppRouter } from '@weareinreach/api'
import {
	buildTrpcTestWrapper,
	createFakeOrgSocialMediaBackend,
	createMswServer,
	ORG,
	SOCIAL_MEDIA_SERVICES,
} from '~ui/test/trpcIntegrationHarness'

/**
 * Real-cache regression coverage for the contact-info "manual refresh" bug, mirroring
 * PhoneNumbers.realCache.test.tsx / Emails.realCache.test.tsx: save it, see it without refreshing, and reopen
 * it to see the latest saved state. Renders the real `SocialMedia` (edit mode) together with the real
 * `SocialMediaDrawer`s it mounts per row, backed by one real `QueryClient` and a real `trpc.Provider`, with
 * only the network boundary faked.
 */

vi.mock('next/router', () => ({
	useRouter: () => ({ query: { slug: ORG.slug }, pathname: '', push: vi.fn() }),
}))

vi.mock('~ui/hooks/useOrgInfo', () => ({
	useOrgInfo: () => ({ id: ORG.id, slug: ORG.slug }),
}))

const trpc = createTRPCReact<AppRouter>()
vi.mock('~ui/lib/trpcClient', () => ({ trpc }))

const { SocialMedia } = await import('./SocialMedia')

let backend: ReturnType<typeof createFakeOrgSocialMediaBackend>
const server = createMswServer([])
const facebookService = SOCIAL_MEDIA_SERVICES[0]
let forEditDrawerRequestCount = 0

beforeAll(() => {
	server.listen({ onUnhandledRequest: 'error' })
	server.events.on('request:start', ({ request }) => {
		if (request.url.includes('orgSocialMedia.forEditDrawer')) {
			forEditDrawerRequestCount += 1
		}
	})
})
beforeEach(() => {
	backend = createFakeOrgSocialMediaBackend()
	server.resetHandlers(...backend.handlers)
	forEditDrawerRequestCount = 0
})
afterAll(() => server.close())

const renderList = () => {
	const { Wrapper } = buildTrpcTestWrapper(trpc, { strictMode: true })
	const view = render(<SocialMedia edit parentId={ORG.id} />, { wrapper: Wrapper })
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
// `SocialMediaEdit` keeps every row's own (closed) `SocialMediaDrawer` mounted, and only role queries
// correctly exclude those from matching.
const usernameField = () => screen.getByRole('textbox', { name: /username/i })

describe('SocialMedia + SocialMediaDrawer - real cache: create, save, see it without refreshing', () => {
	it('shows the new entry in the list immediately, then opens with the same values (not blank)', async () => {
		renderList()
		await screen.findByText(/create new/i)

		await openDrawerFor(/create new/i)
		await userEvent.click(screen.getByRole('combobox', { name: 'Service' }))
		await userEvent.click(await screen.findByText(facebookService.name))
		await userEvent.type(
			screen.getByRole('textbox', { name: /website url/i }),
			'https://facebook.com/coolhandle'
		)
		// The URL's username auto-detect effect is debounced (300ms) - typing it explicitly afterward
		// is deterministic regardless of whether/how the social-links library parsed the URL above.
		await waitFor(() => expect(usernameField()).toBeEnabled())
		await userEvent.clear(usernameField())
		await userEvent.type(usernameField(), 'coolhandle')

		await clickSave()
		await waitFor(() => expect(screen.queryByRole('heading', { name: /Add New/ })).not.toBeInTheDocument())

		// Contract 1: the list reflects the newly created entry without any refresh.
		await screen.findByText('(coolhandle)')

		// Contract 2: opening that same new entry from the list shows what was actually saved.
		await openDrawerFor('(coolhandle)')
		await waitFor(() => {
			expect(usernameField()).toHaveValue('coolhandle')
		})
		expect(screen.getByRole('textbox', { name: /website url/i })).toHaveValue(
			'https://facebook.com/coolhandle'
		)
	})
})

describe('SocialMedia + SocialMediaDrawer - real cache: edit, save, reopen shows the latest', () => {
	// `url`/`username`/`service` are create-only server-side (a plain `update` silently ignores them,
	// confirmed against the real handler - see trpcIntegrationHarness.tsx) - so unlike the other
	// contact-info types, a meaningful "edit" here is limited to Published/Deleted.
	it('reflects a Published toggle in both the list and the reopened form, never reverting', async () => {
		backend.seedOrgSocialMedia({
			url: 'https://facebook.com/original',
			username: 'original',
			serviceId: facebookService.id,
			published: true,
		})
		renderList()

		await openDrawerFor('(original)')
		await waitFor(() => {
			expect(usernameField()).toHaveValue('original')
		})

		await userEvent.click(screen.getByRole('checkbox', { name: /published/i }))
		await clickSave()
		await waitFor(() => expect(screen.queryByRole('heading', { name: /Edit/ })).not.toBeInTheDocument())

		// Contract 1: the list reflects the unpublished state without a refresh - still showing the
		// same username, not reverted or removed.
		await screen.findByText('(original)')

		// Contract 2: reopening shows the unpublished state.
		await openDrawerFor('(original)')
		await waitFor(() => {
			expect(screen.getByRole('checkbox', { name: /published/i })).not.toBeChecked()
		})
	})
})

describe('SocialMedia + SocialMediaDrawer - real cache: reopening after a save does not refetch', () => {
	/**
	 * See Websites.realCache.test.tsx's identical test for the full incident writeup - same mechanism, same
	 * fix, same regression coverage, for orgSocialMedia's `forEditDrawer`.
	 */
	it('does not issue a second forEditDrawer request when reopening the same item after a save', async () => {
		backend.seedOrgSocialMedia({
			url: 'https://facebook.com/no-refetch',
			username: 'no-refetch',
			serviceId: facebookService.id,
			published: false,
		})
		renderList()

		await openDrawerFor('(no-refetch)')
		await waitFor(() => expect(screen.getByRole('checkbox', { name: /published/i })).not.toBeChecked())
		expect(forEditDrawerRequestCount).toBe(1)

		await userEvent.click(screen.getByRole('checkbox', { name: /published/i }))
		await clickSave()
		await waitFor(() => expect(screen.queryByRole('heading', { name: /Edit/ })).not.toBeInTheDocument())
		expect(forEditDrawerRequestCount).toBe(1)

		await openDrawerFor('(no-refetch)')
		expect(forEditDrawerRequestCount).toBe(1)
		await waitFor(() => {
			expect(screen.getByRole('checkbox', { name: /published/i })).toBeChecked()
		})
	})
})

describe('SocialMedia + SocialMediaDrawer - real cache: reusing the Create new trigger for a second item', () => {
	/**
	 * Direct regression test for a live report: click "Create new", the drawer opened but then couldn't be
	 * closed. Root cause: the "Create new" trigger stays mounted across multiple creates (only its own drawer's
	 * open state toggles), and its detail-query id never changed on reopen - harmless before `onSettled`
	 * started patching `forEditDrawer`'s cache, but once that patch exists, a second "Create new" open reused
	 * the first item's id, read back the first item's own now-cached data, and left the drawer's dirty/close
	 * state in a broken combination that neither closed nor showed the "Unsaved changes" prompt. Fixed by (1)
	 * generating a fresh id on every open (matching PhoneDrawer's own established fix for this exact class of
	 * bug) and (2) fully resetting the form to blank on every open, not just a handful of fields.
	 */
	it('reopening "Create new" after saving one item shows a blank form and closes normally', async () => {
		renderList()
		await screen.findByText(/create new/i)

		await userEvent.click(screen.getByText(/create new/i))
		await screen.findByRole('heading', { name: /Add New/i })
		await userEvent.click(screen.getByRole('combobox', { name: 'Service' }))
		await userEvent.click(await screen.findByText(facebookService.name))
		await userEvent.type(screen.getByRole('textbox', { name: /website url/i }), 'https://facebook.com/first')
		await userEvent.clear(screen.getByRole('textbox', { name: /username/i }))
		await userEvent.type(screen.getByRole('textbox', { name: /username/i }), 'first')
		await clickSave()
		await waitFor(() => expect(screen.queryByRole('heading', { name: /Add New/i })).not.toBeInTheDocument())

		await userEvent.click(screen.getByText(/^create new$/i))
		await screen.findByRole('heading', { name: /Add New|Edit/i })

		// Contract 1: the reopened "Create new" form is blank, not the first item's data.
		await waitFor(() => {
			expect(screen.getByRole('textbox', { name: /website url/i })).toHaveValue('')
		})
		expect(screen.getByRole('textbox', { name: /username/i })).toHaveValue('')

		// Contract 2: with nothing typed, the drawer is not dirty and Close actually closes it.
		await userEvent.click(screen.getByRole('button', { name: /close/i }))
		await waitFor(() => {
			expect(screen.queryByRole('heading', { name: /Add New|Edit/i })).not.toBeInTheDocument()
		})
		expect(screen.queryByText('Unsaved Changes')).not.toBeInTheDocument()
	})
})

describe('SocialMedia + SocialMediaDrawer - real cache: a failed save must not wipe the edit', () => {
	/**
	 * Adversarial coverage the happy-path tests above can't surface: every test in this file simulates a save
	 * that actually succeeds. `onSettled` used to call `reset()` unconditionally, which fires on failure too -
	 * a save that failed server-side wiped the user's just-typed, never-saved edit back to blank (this form has
	 * no `defaultValues` configured) with no error shown and no way to recover it. Confirmed by simulating a
	 * real 500 from `orgSocialMedia.upsert`.
	 */
	it('keeps the typed values in the form when the save fails, instead of silently clearing them', async () => {
		renderList()
		await screen.findByText(/create new/i)

		await userEvent.click(screen.getByText(/create new/i))
		await screen.findByRole('heading', { name: /Add New/i })
		await userEvent.click(screen.getByRole('combobox', { name: 'Service' }))
		await userEvent.click(await screen.findByText(facebookService.name))
		await userEvent.type(
			screen.getByRole('textbox', { name: /website url/i }),
			'https://facebook.com/willfail'
		)
		await userEvent.clear(screen.getByRole('textbox', { name: /username/i }))
		await userEvent.type(screen.getByRole('textbox', { name: /username/i }), 'willfail')

		server.use(
			http.post('http://localhost/trpc/orgSocialMedia.upsert', () =>
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

		await waitFor(() => expect(screen.getByRole('button', { name: /^Save$/ })).toBeEnabled())
		await userEvent.click(screen.getByRole('button', { name: /^Save$/ }))

		// The failed save must not silently look like a success or discard the edit: the drawer stays
		// open, and the typed values are still there for the user to retry.
		await waitFor(() => expect(screen.getByRole('button', { name: /^Save$/ })).toBeEnabled())
		expect(screen.getByRole('heading', { name: /Add New/i })).toBeInTheDocument()
		expect(screen.getByRole('textbox', { name: /website url/i })).toHaveValue('https://facebook.com/willfail')
		expect(screen.getByRole('textbox', { name: /username/i })).toHaveValue('willfail')

		// Nothing should have been added to the list either.
		expect(screen.queryByText('(willfail)')).not.toBeInTheDocument()
	})
})

describe('SocialMedia + SocialMediaDrawer - real cache: edit, discard, reopen shows the original (unedited) data', () => {
	/**
	 * See PhoneNumbers.realCache.test.tsx's identical test for the full reasoning - same verified,
	 * correct-and-worth-guarding behavior for orgSocialMedia, despite this form having no `defaultValues`
	 * configured at all (the audit that prompted this flagged that as the highest-risk case for exactly this
	 * reason).
	 */
	it('discarding an edit and reopening the same item shows the real saved data, not blank/default fields', async () => {
		backend.seedOrgSocialMedia({
			url: 'https://facebook.com/original',
			username: 'original',
			serviceId: facebookService.id,
			published: true,
		})
		renderList()

		await openDrawerFor('(original)')
		await waitFor(() => expect(usernameField()).toHaveValue('original'))

		await userEvent.type(usernameField(), 'xxx')

		await userEvent.click(screen.getByRole('button', { name: /close/i }))
		await screen.findByRole('dialog', { name: 'Unsaved Changes' })
		await userEvent.click(screen.getByRole('button', { name: /discard/i }))
		await waitFor(() => expect(screen.queryByText('Unsaved Changes')).not.toBeInTheDocument())
		await waitFor(() => expect(screen.queryByRole('heading', { name: /Edit/ })).not.toBeInTheDocument())

		await openDrawerFor('(original)')
		await waitFor(() => {
			expect(usernameField()).toHaveValue('original')
		})
		expect(screen.getByRole('textbox', { name: /website url/i })).toHaveValue('https://facebook.com/original')
	})
})
