import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { render, screen } from '~ui/test/test-utils'

vi.mock('next/router', () => ({
	useRouter: () => ({ query: { slug: 'mock-org-slug' }, pathname: '', push: vi.fn() }),
}))

vi.mock('~ui/hooks/useOrgInfo', () => ({
	useOrgInfo: () => ({ id: 'organization_test', slug: 'mock-org-slug' }),
}))

// PhoneNumbersEdit imports isIdFor directly from this subpath (not @weareinreach/db's re-export) -
// the real implementation validates a canonical ULID suffix, which none of these fixture ids have.
vi.mock('@weareinreach/db/lib/idGen', () => ({
	isIdFor: (table: string, id: string) => id.startsWith(`${table}_`),
	generateId: (prefix: string) => `${prefix}_generated`,
}))

const linkablePhonesFixture = [
	{
		id: 'orgPhone_link1',
		deleted: false,
		published: true,
		description: null,
		number: '+12025550100',
		phoneType: null,
	},
]

vi.mock('~ui/lib/trpcClient', () => ({
	trpc: {
		organization: { getIdFromSlug: { useQuery: vi.fn() } },
		orgPhone: {
			forContactInfoEdit: { useQuery: vi.fn() },
			getLinkOptions: { useQuery: vi.fn() },
			locationLink: { useMutation: vi.fn() },
			forEditDrawer: { useQuery: vi.fn() },
			upsert: { useMutation: vi.fn() },
		},
		fieldOpt: {
			phoneTypes: { useQuery: vi.fn() },
			countries: { useQuery: vi.fn() },
		},
		useUtils: vi.fn(),
	},
}))

const { trpc } = await import('~ui/lib/trpcClient')
const { PhoneNumbers } = await import('./PhoneNumbers')

const getIdFromSlugMock = vi.mocked(trpc.organization.getIdFromSlug.useQuery)
const forContactInfoEditMock = vi.mocked(trpc.orgPhone.forContactInfoEdit.useQuery)
const getLinkOptionsMock = vi.mocked(trpc.orgPhone.getLinkOptions.useQuery)
const locationLinkMutationMock = vi.mocked(trpc.orgPhone.locationLink.useMutation)
const forEditDrawerMock = vi.mocked(trpc.orgPhone.forEditDrawer.useQuery)
const upsertMutationMock = vi.mocked(trpc.orgPhone.upsert.useMutation)
const phoneTypesMock = vi.mocked(trpc.fieldOpt.phoneTypes.useQuery)
const countriesMock = vi.mocked(trpc.fieldOpt.countries.useQuery)
const useUtilsMock = vi.mocked(trpc.useUtils)

const setup = ({
	isLocation = true,
	phones = [],
}: { isLocation?: boolean; phones?: Record<string, unknown>[] } = {}) => {
	getIdFromSlugMock.mockReturnValue({ data: { id: 'organization_test' }, isLoading: false } as never)
	forContactInfoEditMock.mockReturnValue({ data: phones, isLoading: false } as never)
	getLinkOptionsMock.mockReturnValue({ data: linkablePhonesFixture, isLoading: false } as never)
	const linkMutate = vi.fn()
	locationLinkMutationMock.mockReturnValue({ mutate: linkMutate, isPending: false } as never)

	// Fallback stubs so the nested, closed <PhoneDrawer createNew> trigger this component always
	// renders doesn't crash - none of these tests interact with it directly.
	forEditDrawerMock.mockReturnValue({ data: null, isFetching: false } as never)
	upsertMutationMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)
	phoneTypesMock.mockReturnValue({ data: [], isLoading: false } as never)
	countriesMock.mockReturnValue({ data: [], isLoading: false } as never)
	useUtilsMock.mockReturnValue({
		orgPhone: {
			forContactInfoEdit: { invalidate: vi.fn(), setData: vi.fn() },
			forContactInfo: { invalidate: vi.fn() },
			forEditDrawer: { invalidate: vi.fn() },
		},
	} as never)

	const parentId = isLocation ? 'orgLocation_test' : 'organization_test'
	const view = render(<PhoneNumbers edit parentId={parentId} />)
	return { ...view, linkMutate }
}

describe('PhoneNumbersEdit - link to location menu', () => {
	it('shows "Link or create new..." when the parent is a location', () => {
		setup({ isLocation: true })
		expect(screen.getByText(/link or create new/i)).toBeInTheDocument()
	})

	it('shows plain "Create new" (no link menu) when the parent is an organization, not a location', () => {
		setup({ isLocation: false })
		expect(screen.queryByText(/link or create new/i)).not.toBeInTheDocument()
		expect(screen.getByText(/^create new$/i)).toBeInTheDocument()
	})

	it('clicking a linkable phone in the menu calls locationLink with action: link and the correct ids', async () => {
		const { linkMutate } = setup({ isLocation: true })
		await userEvent.click(screen.getByText(/link or create new/i))
		await userEvent.click(await screen.findByText('+12025550100'))

		expect(linkMutate).toHaveBeenCalledWith({
			orgLocationId: 'orgLocation_test',
			orgPhoneId: 'orgPhone_link1',
			action: 'link',
		})
	})

	/**
	 * The "Create new" item no longer renders a PhoneDrawer nested inside itself (see PhoneNumbers.tsx for why)
	 *
	 * - It click-triggers a real PhoneDrawer rendered as a sibling of the Menu instead. This confirms that
	 *   indirection still actually opens the drawer.
	 */
	it('clicking "Create new" in the location menu still opens the create-phone drawer', async () => {
		setup({ isLocation: true })
		await userEvent.click(screen.getByText(/link or create new/i))
		await userEvent.click(await screen.findByText(/^create new$/i))

		expect(await screen.findByRole('heading', { name: /Add New/i })).toBeInTheDocument()
	})
})

describe('PhoneNumbersEdit - list appearance by published/deleted', () => {
	const basePhone = {
		id: 'orgPhone_1',
		number: '+12025550100',
		ext: null,
		country: 'US',
		primary: false,
		description: null,
		phoneType: null,
		locationOnly: false,
	}

	it('shows the eye-off icon for an unpublished, non-deleted phone', () => {
		const { container } = setup({ phones: [{ ...basePhone, published: false, deleted: false }] })
		expect(screen.getByText('(202) 555-0100')).toBeInTheDocument()
		expect(container.querySelector('[icon="carbon:view-off"]')).toBeInTheDocument()
	})

	it('does not show the eye-off icon for a deleted phone (it gets strikethrough styling instead)', () => {
		const { container } = setup({ phones: [{ ...basePhone, published: true, deleted: true }] })
		expect(screen.getByText('(202) 555-0100')).toBeInTheDocument()
		expect(container.querySelector('[icon="carbon:view-off"]')).not.toBeInTheDocument()
	})

	it('does not show the eye-off icon for a normal published, non-deleted phone', () => {
		const { container } = setup({ phones: [{ ...basePhone, published: true, deleted: false }] })
		expect(screen.getByText('(202) 555-0100')).toBeInTheDocument()
		expect(container.querySelector('[icon="carbon:view-off"]')).not.toBeInTheDocument()
	})

	/**
	 * `deleted` takes precedence over `published` in PhoneNumbers.tsx's renderItem switch - a phone that is
	 * both deleted and unpublished gets strikethrough styling, not the eye-off icon.
	 */
	it('a phone that is both deleted and unpublished renders as deleted (strikethrough), not eye-off', () => {
		const { container } = setup({ phones: [{ ...basePhone, published: false, deleted: true }] })
		expect(screen.getByText('(202) 555-0100')).toBeInTheDocument()
		expect(container.querySelector('[icon="carbon:view-off"]')).not.toBeInTheDocument()
	})
})
