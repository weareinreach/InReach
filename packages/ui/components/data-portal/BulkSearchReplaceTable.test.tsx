import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render, screen, within } from '~ui/test/test-utils'

import { BulkSearchReplaceTable } from './BulkSearchReplaceTable'

// `next-i18next/pages` doesn't resolve under Vite/Vitest (it relies on a Next.js-specific export
// condition) - `vitest.config.mts` aliases it to `react-i18next` directly, which resolves fine and
// works against the real `I18nextProvider` `test-utils.tsx` already sets up.

// The test wrapper doesn't mount Mantine's `<Notifications />` container, so a real `showNotification`
// call never renders anything to assert on in the DOM - assert the call itself instead.
vi.mock('@mantine/notifications', () => ({ showNotification: vi.fn() }))

vi.mock('~ui/lib/trpcClient', () => ({
	trpc: {
		bulkSearchReplace: {
			search: { useQuery: vi.fn() },
			replaceText: { useMutation: vi.fn() },
		},
		organization: {
			updateBasic: { useMutation: vi.fn() },
		},
		service: {
			upsert: { useMutation: vi.fn() },
			bulkAttachTags: { useMutation: vi.fn() },
			bulkDetachTags: { useMutation: vi.fn() },
			bulkAttachAttribute: { useMutation: vi.fn() },
			bulkDetachAttribute: { useMutation: vi.fn() },
		},
		fieldOpt: {
			attributesByCategory: { useQuery: vi.fn() },
		},
		component: {
			ServiceSelect: { useQuery: vi.fn() },
		},
		useUtils: vi.fn(),
	},
}))

const { showNotification } = await import('@mantine/notifications')
const { trpc } = await import('~ui/lib/trpcClient')
const useSearchMock = vi.mocked(trpc.bulkSearchReplace.search.useQuery)
const useReplaceTextMock = vi.mocked(trpc.bulkSearchReplace.replaceText.useMutation)
const useUpdateBasicMock = vi.mocked(trpc.organization.updateBasic.useMutation)
const useUpsertMock = vi.mocked(trpc.service.upsert.useMutation)
const useBulkAttachTagsMock = vi.mocked(trpc.service.bulkAttachTags.useMutation)
const useBulkDetachTagsMock = vi.mocked(trpc.service.bulkDetachTags.useMutation)
const useBulkAttachAttributeMock = vi.mocked(trpc.service.bulkAttachAttribute.useMutation)
const useBulkDetachAttributeMock = vi.mocked(trpc.service.bulkDetachAttribute.useMutation)
const useAttributesByCategoryMock = vi.mocked(trpc.fieldOpt.attributesByCategory.useQuery)
const useServiceSelectMock = vi.mocked(trpc.component.ServiceSelect.useQuery)
const useUtilsMock = vi.mocked(trpc.useUtils)

const SEARCH_RESULT = {
	results: [
		{
			id: 'org_1',
			name: 'Riverside Community Health Center',
			slug: 'riverside-community-health-center',
			description: 'Due to COVID-19, all services are now virtual only.',
			lastVerified: '2024-03-12T00:00:00.000Z',
			updatedAt: '2024-03-12T00:00:00.000Z',
			createdAt: '2023-01-01T00:00:00.000Z',
			deleted: false,
			published: true,
			unpublishedReason: null,
			matches: ['orgDescription'],
			services: [
				{
					id: 'osvc_1',
					name: 'Virtual Counseling COVID-19',
					description: 'Individual and group therapy sessions.',
					updatedAt: '2024-03-12T00:00:00.000Z',
					createdAt: '2023-02-01T00:00:00.000Z',
					deleted: false,
					published: true,
					attributeIds: [],
					tagIds: [],
					orgLocationId: 'oloc_1',
					matches: ['serviceName'],
				},
			],
		},
	],
	total: 1,
}

describe('BulkSearchReplaceTable', () => {
	beforeEach(() => {
		useSearchMock.mockReturnValue({
			data: undefined,
			isLoading: false,
			isFetching: false,
			isError: false,
		} as never)
		useReplaceTextMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)
		useUpdateBasicMock.mockReturnValue({ mutate: vi.fn() } as never)
		useUpsertMock.mockReturnValue({ mutate: vi.fn() } as never)
		useBulkAttachTagsMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)
		useBulkDetachTagsMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)
		useBulkAttachAttributeMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)
		useBulkDetachAttributeMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)
		useAttributesByCategoryMock.mockReturnValue({ data: [] } as never)
		useServiceSelectMock.mockReturnValue({ data: [] } as never)
		useUtilsMock.mockReturnValue({ bulkSearchReplace: { search: { invalidate: vi.fn() } } } as never)
	})

	it('defaults to searching Org name/description and Service name/description, with attributes/tags unchecked', () => {
		render(<BulkSearchReplaceTable />)

		expect(screen.getByRole('checkbox', { name: 'Org name' })).toBeChecked()
		expect(screen.getByRole('checkbox', { name: 'Org description' })).toBeChecked()
		expect(screen.getByRole('checkbox', { name: 'Service name' })).toBeChecked()
		expect(screen.getByRole('checkbox', { name: 'Service description' })).toBeChecked()
		expect(screen.getByRole('checkbox', { name: 'Service attributes' })).not.toBeChecked()
		expect(screen.getByRole('checkbox', { name: 'Service tags' })).not.toBeChecked()
	})

	it('disables Search until something is typed, and nothing queries until it is clicked', async () => {
		const user = userEvent.setup()
		render(<BulkSearchReplaceTable />)

		expect(screen.getByRole('button', { name: 'Search' })).toBeDisabled()
		// `enabled: false` on every render before a search is committed - confirms Search is a real gate,
		// not just a disabled button with a query already running underneath it.
		expect(useSearchMock).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ enabled: false }))

		await user.type(screen.getByLabelText('Search for'), 'COVID-19')
		expect(screen.getByRole('button', { name: 'Search' })).toBeEnabled()

		await user.click(screen.getByRole('button', { name: 'Search' }))
		expect(useSearchMock).toHaveBeenLastCalledWith(
			expect.objectContaining({ search: 'COVID-19' }),
			expect.objectContaining({ enabled: true })
		)
	})

	it('shows the Search button as busy while a search is in flight', async () => {
		const user = userEvent.setup()
		useSearchMock.mockReturnValue({
			data: undefined,
			isLoading: true,
			isFetching: true,
			isError: false,
		} as never)
		render(<BulkSearchReplaceTable />)

		await user.type(screen.getByLabelText('Search for'), 'COVID-19')
		expect(screen.getByRole('button', { name: 'Search' })).toHaveAttribute('data-loading', 'true')
	})

	it('renders matched org and service rows with their match reason, once results resolve', async () => {
		const user = userEvent.setup()
		useSearchMock.mockReturnValue({
			data: SEARCH_RESULT,
			isLoading: false,
			isFetching: false,
			isError: false,
		} as never)
		render(<BulkSearchReplaceTable />)

		await user.type(screen.getByLabelText('Search for'), 'COVID-19')
		await user.click(screen.getByRole('button', { name: 'Search' }))

		// Scoped to the results table - "Org description"/"Service name" also appear as scope-checkbox
		// labels in the search form above it.
		const table = within(screen.getByRole('table'))
		expect(table.getByText('Riverside Community Health Center')).toBeInTheDocument()
		expect(table.getByText('Virtual Counseling COVID-19')).toBeInTheDocument()
		expect(table.getByText(/org description/i)).toBeInTheDocument()
		expect(table.getByText(/^service name/i)).toBeInTheDocument()
	})

	it('both rows start checked (they have a replaceable match), and Replace All is disabled until Replace-with is typed', async () => {
		const user = userEvent.setup()
		useSearchMock.mockReturnValue({
			data: SEARCH_RESULT,
			isLoading: false,
			isFetching: false,
			isError: false,
		} as never)
		render(<BulkSearchReplaceTable />)

		await user.type(screen.getByLabelText('Search for'), 'COVID-19')
		await user.click(screen.getByRole('button', { name: 'Search' }))

		expect(screen.getByRole('checkbox', { name: 'Select all rows' })).toBeChecked()
		expect(screen.getByRole('button', { name: /replace all/i })).toBeDisabled()

		await user.type(screen.getByLabelText('Replace with (optional)'), 'the pandemic')
		expect(screen.getByRole('button', { name: /replace all \(2\)/i })).toBeEnabled()
	})

	it('unchecking one row excludes it from the Replace All count and from what gets submitted', async () => {
		const user = userEvent.setup()
		const mutate = vi.fn()
		useReplaceTextMock.mockReturnValue({ mutate, isPending: false } as never)
		useSearchMock.mockReturnValue({
			data: SEARCH_RESULT,
			isLoading: false,
			isFetching: false,
			isError: false,
		} as never)
		render(<BulkSearchReplaceTable />)

		await user.type(screen.getByLabelText('Search for'), 'COVID-19')
		await user.click(screen.getByRole('button', { name: 'Search' }))
		await user.type(screen.getByLabelText('Replace with (optional)'), 'the pandemic')

		// Both rows start checked (each has a replaceable match), so both render this same label - the
		// org row renders first, then its expanded service sub-row; deselect the service row (index 1)
		// so the remaining, submitted item is the org row asserted on below.
		await user.click(screen.getAllByRole('checkbox', { name: 'Deselect row' })[1]!)
		expect(screen.getByRole('button', { name: /replace all \(1\)/i })).toBeInTheDocument()

		await user.click(screen.getByRole('button', { name: /replace all/i }))
		expect(mutate).toHaveBeenCalledWith({
			items: [
				{
					recordType: 'organization',
					field: 'description',
					id: 'org_1',
					searchTerm: 'COVID-19',
					replaceTerm: 'the pandemic',
				},
			],
		})
	})

	it('"Add / Remove Tag or Attribute" is disabled with nothing selected', async () => {
		// The bulk-edit button only renders once a search is committed, and rows start checked by
		// default (they have a replaceable match) - deselect everything via the header checkbox to
		// reach the "nothing selected" state this test is actually about.
		const user = userEvent.setup()
		useSearchMock.mockReturnValue({
			data: SEARCH_RESULT,
			isLoading: false,
			isFetching: false,
			isError: false,
		} as never)
		render(<BulkSearchReplaceTable />)

		await user.type(screen.getByLabelText('Search for'), 'COVID-19')
		await user.click(screen.getByRole('button', { name: 'Search' }))

		await user.click(screen.getByRole('checkbox', { name: 'Select all rows' }))
		expect(screen.getByRole('button', { name: /add \/ remove tag or attribute/i })).toBeDisabled()
	})

	it("previews the selected attribute's per-service status before Apply, and reports a result count notification after", async () => {
		const user = userEvent.setup()
		useSearchMock.mockReturnValue({
			data: SEARCH_RESULT,
			isLoading: false,
			isFetching: false,
			isError: false,
		} as never)
		useAttributesByCategoryMock.mockReturnValue({
			data: [
				{
					attributeId: 'attr_1',
					attributeKey: 'attr.test',
					requireText: false,
					requireBoolean: false,
					requireData: false,
					requireLanguage: false,
					requireGeo: false,
				},
			],
		} as never)
		const mutate = vi.fn((_input, opts: { onSuccess: (result: unknown) => void }) =>
			opts.onSuccess({ added: 1, alreadyHad: 0 })
		)
		useBulkAttachAttributeMock.mockReturnValue({ mutate, isPending: false } as never)
		render(<BulkSearchReplaceTable />)

		await user.type(screen.getByLabelText('Search for'), 'COVID-19')
		await user.click(screen.getByRole('button', { name: 'Search' }))
		await user.click(screen.getByRole('button', { name: /add \/ remove tag or attribute/i }))

		await user.click(await screen.findByPlaceholderText('Choose a value'))
		// Mantine renders combobox dropdowns via a portal near document.body, not nested inside the
		// dialog, so DOM scoping can't disambiguate. The toolbar's own "Attributes" filter renders an
		// option with the same label from the same underlying data - distinguish by `value` instead:
		// this dialog's options are prefixed (`attribute:<id>`), the toolbar filter's are the bare id.
		const attributeOption = (await screen.findAllByRole('option', { name: 'attr.test', hidden: true })).find(
			(el) => el.getAttribute('value') === 'attribute:attr_1'
		)
		await user.click(attributeOption!)

		// The fixture's service has an empty attributeIds array - the preview should reflect that
		// nothing has this attribute yet, before Apply is ever clicked.
		expect(screen.getByText('Will add')).toBeInTheDocument()

		await user.click(screen.getByRole('button', { name: 'Apply' }))
		expect(mutate).toHaveBeenCalledWith(
			{ serviceIds: ['osvc_1'], attributeId: 'attr_1' },
			expect.objectContaining({ onSuccess: expect.any(Function) })
		)
		expect(showNotification).toHaveBeenCalledWith(
			expect.objectContaining({ message: 'Added to 1 service(s); 0 already had it.' })
		)
	})

	it('renders Actions as the first named column, with distinct Quick edit and Open full edit page actions', async () => {
		const user = userEvent.setup()
		useSearchMock.mockReturnValue({
			data: SEARCH_RESULT,
			isLoading: false,
			isFetching: false,
			isError: false,
		} as never)
		render(<BulkSearchReplaceTable />)

		await user.type(screen.getByLabelText('Search for'), 'COVID-19')
		await user.click(screen.getByRole('button', { name: 'Search' }))

		const table = within(screen.getByRole('table'))
		const headers = table.getAllByRole('columnheader').map((el) => el.textContent)
		// First header is the (unlabeled) select-all checkbox column - Actions is the first named one.
		expect(headers.slice(1, 6)).toEqual(['Actions', 'Name', 'Matches', 'Service Tags', 'Attributes'])

		// Quick edit renders as a real button (opens an in-page popover); the full-edit action renders as
		// a real link (navigates away), not a button - the two must be distinguishable both visually and
		// by accessible role.
		expect(table.getAllByRole('button', { name: 'Quick edit' })).toHaveLength(2)
		const fullEditLinks = table.getAllByRole('link', { name: 'Open full edit page' })
		expect(fullEditLinks).toHaveLength(2)
		// The org row's href is a typed `Route` object rendered through plain `next/link` with no real
		// Next.js router context mounted (this test suite doesn't run a full Next app) - dynamic-segment
		// interpolation (`[slug]` -> the real slug) only happens with that context present, so this
		// renders as literal querystring serialization here, not the interpolated path a real app shows.
		expect(fullEditLinks[0]).toHaveAttribute(
			'href',
			'/org/[slug]/edit?slug=riverside-community-health-center'
		)
		// The service row's href is a plain string built by hand (see FullEditLink) - no router context
		// needed, so this one already reflects the real, final URL.
		expect(fullEditLinks[1]).toHaveAttribute(
			'href',
			'/org/riverside-community-health-center/oloc_1/edit?serviceId=osvc_1'
		)
	})

	it('resolves Service Tags/Attributes id arrays to names for service rows, and leaves them blank for org rows', async () => {
		const user = userEvent.setup()
		const fixture = {
			results: [
				{
					...SEARCH_RESULT.results[0],
					services: [
						{
							...SEARCH_RESULT.results[0]!.services[0],
							attributeIds: ['attr_lookup'],
							tagIds: ['tag_lookup'],
						},
					],
				},
			],
			total: 1,
		}
		useSearchMock.mockReturnValue({
			data: fixture,
			isLoading: false,
			isFetching: false,
			isError: false,
		} as never)
		useAttributesByCategoryMock.mockReturnValue({
			data: [{ attributeId: 'attr_lookup', attributeKey: 'Wheelchair accessible' }],
		} as never)
		useServiceSelectMock.mockReturnValue({
			data: [
				{ tsKey: 'cat', active: true, services: [{ id: 'tag_lookup', tsKey: 'Food pantry', active: true }] },
			],
		} as never)
		render(<BulkSearchReplaceTable />)

		await user.type(screen.getByLabelText('Search for'), 'COVID-19')
		await user.click(screen.getByRole('button', { name: 'Search' }))

		const table = within(screen.getByRole('table'))
		expect(table.getByText('Wheelchair accessible')).toBeInTheDocument()
		expect(table.getByText('Food pantry')).toBeInTheDocument()
	})

	it('renders Status per row type (once shown via the column menu, since it is hidden by default) and strikes through a deleted row', async () => {
		const user = userEvent.setup()
		const fixture = {
			results: [
				{
					...SEARCH_RESULT.results[0],
					deleted: true,
					published: false,
					unpublishedReason: 'NEW',
					services: [{ ...SEARCH_RESULT.results[0]!.services[0], published: false }],
				},
			],
			total: 1,
		}
		useSearchMock.mockReturnValue({
			data: fixture,
			isLoading: false,
			isFetching: false,
			isError: false,
		} as never)
		render(<BulkSearchReplaceTable />)

		await user.type(screen.getByLabelText('Search for'), 'COVID-19')
		await user.click(screen.getByRole('button', { name: 'Search' }))

		// Status isn't one of the five default-visible columns - reveal it via the column menu first.
		await user.click(screen.getByRole('button', { name: 'Show/hide columns' }))
		await user.click(await screen.findByRole('menuitem', { name: 'Status' }))

		const table = within(screen.getByRole('table'))
		expect(table.getByText('New')).toBeInTheDocument()
		expect(table.getByText('Unpublished')).toBeInTheDocument()
		const orgRow = screen.getByText('Riverside Community Health Center').closest('tr')
		expect(orgRow).toHaveStyle({ textDecoration: 'line-through' })
	})

	it('defaults to hiding deleted organizations, and the Service Tags/Attributes filters feed the search query', async () => {
		const user = userEvent.setup()
		useAttributesByCategoryMock.mockReturnValue({
			data: [{ attributeId: 'attr_filter', attributeKey: 'attr.filter' }],
		} as never)
		useServiceSelectMock.mockReturnValue({
			data: [
				{ tsKey: 'cat', active: true, services: [{ id: 'tag_filter', tsKey: 'tag.filter', active: true }] },
			],
		} as never)
		render(<BulkSearchReplaceTable />)

		await user.type(screen.getByLabelText('Search for'), 'COVID-19')
		await user.click(screen.getByRole('button', { name: 'Search' }))
		expect(useSearchMock).toHaveBeenLastCalledWith(
			expect.objectContaining({ deleted: false, serviceTagIds: undefined, serviceAttributeIds: undefined }),
			expect.anything()
		)

		// MultiSelect renders both the visible combobox input and a hidden form-value mirror, both
		// sharing the same label - the hidden one (`data-type="hidden"`) isn't the one to click.
		const tagsInput = screen
			.getAllByLabelText('Service Tags')
			.find((el) => el.getAttribute('data-type') !== 'hidden')
		await user.click(tagsInput!)
		await user.click(await screen.findByRole('option', { name: 'tag.filter', hidden: true }))
		expect(useSearchMock).toHaveBeenLastCalledWith(
			expect.objectContaining({ serviceTagIds: ['tag_filter'] }),
			expect.anything()
		)

		const attributesInput = screen
			.getAllByLabelText('Attributes')
			.find((el) => el.getAttribute('data-type') !== 'hidden')
		await user.click(attributesInput!)
		await user.click(await screen.findByRole('option', { name: 'attr.filter', hidden: true }))
		expect(useSearchMock).toHaveBeenLastCalledWith(
			expect.objectContaining({ serviceAttributeIds: ['attr_filter'] }),
			expect.anything()
		)
	})
})
