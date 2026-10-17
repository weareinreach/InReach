import { MantineProvider } from '@mantine/core'
import { render as rtlRender } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { type ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import { describe, expect, it, vi } from 'vitest'

import { SearchStateProvider } from '~ui/providers/SearchState'
import { testI18n } from '~ui/test/i18nTestInstance'
import { screen, waitFor } from '~ui/test/test-utils'
import { storybookTheme } from '~ui/theme/storybook'

import { MoreFilter, type MoreFilterProps } from './MoreFilter'

/**
 * Mantine's polymorphic `component` prop doesn't type-check cleanly as a plain JSX element outside its own
 * file - same issue and same one-line suppression as MoreFilter.stories.tsx's `MoreFilterWrapper`.
 */
const TestMoreFilter = (props: MoreFilterProps) => {
	// @ts-expect-error I don't know why - but I'm over it.
	return <MoreFilter {...props} />
}

vi.mock('~ui/lib/trpcClient', () => ({
	trpc: { attribute: { getFilterOptions: { useQuery: vi.fn() } } },
}))

const { trpc } = await import('~ui/lib/trpcClient')
const getFilterOptionsMock = vi.mocked(trpc.attribute.getFilterOptions.useQuery)

/**
 * Real ids/tsKeys/filterTypes from packages/db/generated/allAttributes.ts (the raw handler shape - MoreFilter
 * calls `useQuery()` with no `select`, so unlike ServiceFilter there's no client-side transform to account
 * for). packages/ui/mockData/json/attribute.getFilterOptions.json previously had stale hyphen-joined tsKeys
 * (e.g. "additional-has-confidentiality-policy") left over from before the real data switched to
 * dot-namespaced keys (e.g. "additional.has-confidentiality-policy") - fixed alongside this test since a
 * hyphen-joined tsKey doesn't resolve against the nested locale JSON and would've silently rendered the raw
 * key as the label.
 */
const mockAttributeOptions = [
	{
		id: 'attr_01GW2HHFV3BADK80TG0DXXFPMM',
		tsKey: 'additional.has-confidentiality-policy',
		tsNs: 'attribute',
		filterType: 'INCLUDE' as const,
	},
	{
		id: 'attr_01GW2HHFVHZ599M48CMSPGDCSC',
		tsKey: 'eligibility.req-photo-id',
		tsNs: 'attribute',
		filterType: 'EXCLUDE' as const,
	},
]

/**
 * Renders with a real, custom-seeded SearchStateProvider - the shared test-utils render() always uses a fixed
 * empty initState, but several cases here need control over the initial `a` (attributes) selection.
 */
const renderWithAttributes = (ui: ReactNode, initialAttributes: string[] = []) => {
	const Wrapper = ({ children }: { children: ReactNode }) => (
		<MantineProvider theme={storybookTheme} defaultColorScheme='light'>
			<I18nextProvider i18n={testI18n}>
				<SearchStateProvider initState={{ params: [], a: initialAttributes }}>{children}</SearchStateProvider>
			</I18nextProvider>
		</MantineProvider>
	)
	return rtlRender(ui, { wrapper: Wrapper })
}

describe('MoreFilter', () => {
	it('8.1: checking an INCLUDE attribute adds it to the Include section and to searchState.attributes', async () => {
		getFilterOptionsMock.mockReturnValue({ data: mockAttributeOptions, status: 'success' } as never)

		renderWithAttributes(<TestMoreFilter resultCount={0} />)
		await userEvent.setup().click(screen.getByRole('button', { name: /More options/i }))
		await userEvent.setup().click(await screen.findByLabelText('Has A Confidentiality Policy'))

		await waitFor(() => expect(screen.getByLabelText('Has A Confidentiality Policy')).toBeChecked())
		expect(screen.getByLabelText('REQUIRES a photo ID')).not.toBeChecked()
		expect(document.querySelector('[class*="count"]')).toHaveTextContent('1')
	})

	it('8.2: checking an EXCLUDE attribute adds it to the Exclude section, distinct from Include', async () => {
		getFilterOptionsMock.mockReturnValue({ data: mockAttributeOptions, status: 'success' } as never)

		renderWithAttributes(<TestMoreFilter resultCount={0} />)
		await userEvent.setup().click(screen.getByRole('button', { name: /More options/i }))

		// findBy*, not getBy*: Mantine's Modal open transition hasn't necessarily finished by the
		// time userEvent's click resolves (same gotcha as ServiceFilter's tests).
		const includeHeading = await screen.findByRole('heading', { name: 'Include resources that...' })
		const excludeHeading = screen.getByRole('heading', { name: 'Exclude resources that...' })
		// Sanity check on section order/labels before asserting the checkbox lands in the right one -
		// `getByLabelText` alone can't tell us which <Stack> section a checkbox rendered into.
		expect(
			includeHeading.compareDocumentPosition(excludeHeading) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy()

		const excludeCheckbox = await screen.findByLabelText('REQUIRES a photo ID')
		expect(
			excludeHeading.compareDocumentPosition(excludeCheckbox) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy()

		await userEvent.setup().click(excludeCheckbox)
		await waitFor(() => expect(screen.getByLabelText('REQUIRES a photo ID')).toBeChecked())
		expect(screen.getByLabelText('Has A Confidentiality Policy')).not.toBeChecked()
	})

	it('8.3: a selection made right after mount is not clobbered by the async values-sync race', async () => {
		getFilterOptionsMock.mockReturnValue({ data: mockAttributeOptions, status: 'success' } as never)

		renderWithAttributes(<TestMoreFilter resultCount={0} />)
		await userEvent.setup().click(screen.getByRole('button', { name: /More options/i }))
		// No `waitFor` settle before clicking - deliberately exercises the race the `hasHydrated`/
		// `suppressNextWriteback` guards (MoreFilter.tsx) are there to prevent.
		await userEvent.setup().click(await screen.findByLabelText('Has A Confidentiality Policy'))

		await waitFor(() => expect(screen.getByLabelText('Has A Confidentiality Policy')).toBeChecked())
		// If the guard failed, the write-back effect would fire on a stale (unchecked) form.values
		// snapshot, flip searchState back to empty, and re-hydrate the form back to unchecked.
		await new Promise((r) => setTimeout(r, 300))
		expect(screen.getByLabelText('Has A Confidentiality Policy')).toBeChecked()
	})

	it('8.4: disabled - the trigger is visibly present but non-interactive', () => {
		getFilterOptionsMock.mockReturnValue({ data: mockAttributeOptions, status: 'success' } as never)

		renderWithAttributes(<TestMoreFilter resultCount={0} disabled />)

		expect(screen.getByRole('button', { name: /More options/i })).toBeDisabled()
	})

	it('8.5: no attributes selected shows no count badge anywhere', () => {
		getFilterOptionsMock.mockReturnValue({ data: mockAttributeOptions, status: 'success' } as never)

		renderWithAttributes(<TestMoreFilter resultCount={0} />, [])

		expect(document.querySelector('[class*="count"]')).not.toBeInTheDocument()
	})

	it('8.6: selecting attributes across Include and Exclude shows the correct total count', () => {
		getFilterOptionsMock.mockReturnValue({ data: mockAttributeOptions, status: 'success' } as never)

		renderWithAttributes(<TestMoreFilter resultCount={0} />, [
			'attr_01GW2HHFV3BADK80TG0DXXFPMM',
			'attr_01GW2HHFVHZ599M48CMSPGDCSC',
		])

		expect(document.querySelector('[class*="count"]')).toHaveTextContent('2')
	})

	it('8.7: the confirm button text reflects resultCount and updates when it changes', async () => {
		getFilterOptionsMock.mockReturnValue({ data: mockAttributeOptions, status: 'success' } as never)

		const { rerender } = renderWithAttributes(<TestMoreFilter resultCount={5} />)
		await userEvent.setup().click(screen.getByRole('button', { name: /More options/i }))
		expect(await screen.findByText('View 5 results')).toBeInTheDocument()

		rerender(<TestMoreFilter resultCount={12} />)
		expect(screen.getByText('View 12 results')).toBeInTheDocument()
	})
})
