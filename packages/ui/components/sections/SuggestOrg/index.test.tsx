import { describe, expect, it, vi } from 'vitest'

import { render, screen } from '~ui/test/test-utils'

import { SuggestOrg } from './index'

// ModalTitle -> Breadcrumb calls next/router's useRouter(), which throws without a mounted
// RouterContext (nothing in this render tree provides one) - stub it, same as any other test
// rendering a component that pulls in Breadcrumb would need to.
vi.mock('next/router', () => ({
	useRouter: () => ({
		pathname: '',
		query: {},
		locale: 'en',
		push: vi.fn(),
	}),
}))

// See DuplicateServiceModal's test file for why ModalTitle is stubbed here: it transitively forms
// a circular import through the modals directory that crashes Vitest's SSR module loader when the
// generated Prisma client isn't present (as in CI). Nothing in this file asserts on ModalTitle.
vi.mock('~ui/modals/ModalTitle', () => ({
	ModalTitle: () => null,
}))

vi.mock('~ui/lib/trpcClient', () => ({
	trpc: {
		organization: {
			createNewSuggestion: { useMutation: vi.fn() },
			createOrgFromDataPortal: { useMutation: vi.fn() },
			suggestionOptions: { useQuery: vi.fn() },
			getPotentialMatches: { useQuery: vi.fn() },
			generateSlug: { useQuery: vi.fn() },
			forOrgPage: { useQuery: vi.fn() },
		},
		geo: {
			autocomplete: { useQuery: vi.fn() },
			geoByPlaceId: { useQuery: vi.fn() },
		},
	},
}))

const { trpc } = await import('~ui/lib/trpcClient')
const useCreateNewSuggestionMock = vi.mocked(trpc.organization.createNewSuggestion.useMutation)
const useCreateOrgFromDataPortalMock = vi.mocked(trpc.organization.createOrgFromDataPortal.useMutation)
const useSuggestionOptionsMock = vi.mocked(trpc.organization.suggestionOptions.useQuery)
const useGetPotentialMatchesMock = vi.mocked(trpc.organization.getPotentialMatches.useQuery)
const useGenerateSlugMock = vi.mocked(trpc.organization.generateSlug.useQuery)
const useForOrgPageMock = vi.mocked(trpc.organization.forOrgPage.useQuery)
const useAutocompleteMock = vi.mocked(trpc.geo.autocomplete.useQuery)
const useGeoByPlaceIdMock = vi.mocked(trpc.geo.geoByPlaceId.useQuery)

describe('SuggestOrg', () => {
	it('sets spellCheck on the organization name field, but not on the website/address fields', () => {
		useCreateNewSuggestionMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)
		useCreateOrgFromDataPortalMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)
		useSuggestionOptionsMock.mockReturnValue({
			data: { countries: [], serviceTypes: [], communities: [] },
			isLoading: false,
			isSuccess: true,
			isError: false,
		} as never)
		useGetPotentialMatchesMock.mockReturnValue({ data: undefined, isFetching: false } as never)
		useGenerateSlugMock.mockReturnValue({ data: undefined } as never)
		useForOrgPageMock.mockReturnValue({ data: undefined, isLoading: false } as never)
		useAutocompleteMock.mockReturnValue({ data: undefined } as never)
		useGeoByPlaceIdMock.mockReturnValue({ data: undefined } as never)

		render(<SuggestOrg />)

		const [orgName, website, address] = screen.getAllByRole('textbox')

		expect(orgName).toHaveAttribute('spellcheck', 'true')
		expect(website).not.toHaveAttribute('spellcheck', 'true')
		expect(address).not.toHaveAttribute('spellcheck', 'true')
	})
})
