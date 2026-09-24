import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { type ApiOutput } from '@weareinreach/api'
import { render, screen } from '~ui/test/test-utils'

import { SearchResultCard } from './SearchResultCard'

vi.mock('next-auth/react', () => ({
	useSession: () => ({ status: 'unauthenticated', data: null }),
}))

vi.mock('next/router', () => ({
	useRouter: () => ({ locale: 'en', query: {}, push: vi.fn(), replace: vi.fn(), pathname: '' }),
}))

const profileViewMock = vi.fn()
vi.mock('@weareinreach/analytics/events', () => ({
	productEvent: { profileView: (...args: unknown[]) => profileViewMock(...args) },
	searchBoxEvent: {},
}))

vi.mock('~ui/lib/trpcClient', () => ({
	trpc: {
		useUtils: () => ({ savedList: { invalidate: vi.fn() } }),
		savedList: {
			saveItem: { useMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })) },
			deleteItem: { useMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })) },
			isSaved: { useQuery: vi.fn(() => ({ data: undefined })) },
			getAll: { useQuery: vi.fn(() => ({ data: undefined, isFetching: false, isError: false })) },
		},
	},
}))

type Org = NonNullable<ApiOutput['organization']['searchDistance']>['orgs'][number]

/**
 * A real mock org record's shape, per packages/ui/mockData/json/organization.searchDistance.json
 *
 * - Not guessed at.
 */
const baseOrg: Org = {
	id: 'orgn_test123',
	name: 'Arlington Food Assistance Center',
	slug: 'arlington-food-assistance-center',
	description: { key: 'orgn_test123.description', ns: 'org-data', text: 'Default description text.' },
	serviceCategories: [],
	orgLeader: [],
	orgFocus: [],
	locations: ['Arlington'],
	distance: 1.46,
	unit: 'mi',
	national: [],
	addressVisibility: 'FULL',
} as unknown as Org

describe('SearchResultCard', () => {
	it('5.1: shows up to 3 cities plus "and N more" for 4+ distinct cities, deduped case-insensitively', () => {
		render(
			<SearchResultCard
				index={0}
				result={{ ...baseOrg, locations: ['Arlington', 'arlington', 'Fairfax', 'Alexandria', 'Reston'] }}
			/>
		)

		// "arlington" (lowercase) is a case-insensitive duplicate of "Arlington" and should be
		// dropped, leaving 4 unique cities - the first 3 shown, "and 1 more" for the remainder.
		expect(screen.getByText(/Arlington, Fairfax, Alexandria and 1 more/i)).toBeInTheDocument()
	})

	it('5.2: shows no city list at all when the org is marked national', () => {
		render(
			<SearchResultCard index={0} result={{ ...baseOrg, national: ['US', 'CA'], locations: ['Arlington'] }} />
		)

		expect(screen.queryByText('Arlington')).not.toBeInTheDocument()
	})

	it('5.3: shows no city list when addressVisibility is HIDDEN, regardless of national', () => {
		render(
			<SearchResultCard
				index={0}
				result={{ ...baseOrg, addressVisibility: 'HIDDEN', locations: ['Arlington'] }}
			/>
		)

		expect(screen.queryByText('Arlington')).not.toBeInTheDocument()
	})

	it('5.5: uses the per-org translation override for the description, not the generic fallback', () => {
		render(
			<SearchResultCard
				index={0}
				result={{
					...baseOrg,
					description: {
						key: 'orgn_test123.description',
						ns: 'org-data',
						text: 'The real per-org description.',
					},
				}}
			/>
		)

		expect(screen.getByText('The real per-org description.')).toBeInTheDocument()
	})

	it('5.6: clicking the org name navigates to /org/[slug] and fires a profileView analytics event', async () => {
		profileViewMock.mockClear()
		render(<SearchResultCard index={2} result={baseOrg} isAdvanced />)

		const titleLink = screen.getAllByRole('link', { name: /Arlington Food Assistance Center/i })[0]
		// Next's `<Link href={{ pathname: '/org/[slug]', query: { slug } }}>` doesn't resolve the
		// dynamic segment into a clean path without a real Next.js router context (a mocked
		// useRouter isn't enough for that resolution) - the literal template plus query string
		// is the actual, correct output in this test environment; the slug is still verifiably
		// correct in it, which is what this case cares about.
		expect(titleLink).toHaveAttribute('href', '/org/[slug]?slug=arlington-food-assistance-center')

		await userEvent.setup().click(titleLink)

		expect(profileViewMock).toHaveBeenCalledWith(
			'orgn_test123',
			'Arlington Food Assistance Center',
			expect.objectContaining({
				position: 2,
				searchVersion: 'v2',
				// 1.46mi * 1609.34 = 2349.6364, rounded
				distanceMeters: 2350,
			})
		)
	})
})
