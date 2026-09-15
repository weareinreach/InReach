import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render, screen, waitFor } from '~ui/test/test-utils'

import { ServiceEditDrawer } from './index'

vi.mock('next/router', () => ({
	useRouter: () => ({ pathname: '/org/[slug]/edit', query: {}, push: vi.fn() }),
}))

// This drawer's `organizationId` comes from `useOrgInfo` (slug -> org lookup), not from a real
// column returned by `service.forServiceEditDrawer` - mocked directly here rather than mocking the
// slug/query chain underneath it.
const ORG_ID = 'orgn_TESTORG0000000000000000'
vi.mock('~ui/hooks/useOrgInfo', () => ({
	useOrgInfo: () => ({ id: ORG_ID, slug: 'test-org' }),
}))

vi.mock('@mantine/notifications', () => ({
	showNotification: vi.fn(),
}))

// None of these are under test here - stubbed out so this file doesn't also need to mock each
// one's own internal tRPC calls.
vi.mock('~ui/components/data-display/ContactInfo', () => ({
	ContactInfo: () => null,
	hasContactInfo: () => false,
}))
vi.mock('~ui/components/data-display/Hours', () => ({ Hours: () => null }))
vi.mock('~ui/components/data-portal/ServiceSelect', () => ({
	ServiceSelect: (props: { children?: React.ReactNode }) => <>{props.children}</>,
}))
vi.mock('~ui/modals/CoverageArea', () => ({
	CoverageArea: (props: { children?: React.ReactNode }) => <>{props.children}</>,
}))
vi.mock('~ui/modals/dataPortal/Attributes', () => ({
	AttributeModal: (props: { children?: React.ReactNode }) => <>{props.children}</>,
}))
vi.mock('~ui/modals/dataPortal/DuplicateService', () => ({
	DuplicateServiceModal: (props: { children?: React.ReactNode }) => <>{props.children}</>,
}))
vi.mock('~ui/modals/Service/ModalText', () => ({
	ModalText: (props: { children?: React.ReactNode }) => <>{props.children}</>,
}))
vi.mock('./AttributeEditWrapper', () => ({
	AttributeEditWrapper: (props: { children?: React.ReactNode }) => <>{props.children}</>,
}))
vi.mock('./ServiceAreaItem', () => ({
	ServiceAreaItem: (props: { children?: React.ReactNode }) => <>{props.children}</>,
}))

vi.mock('~ui/lib/trpcClient', () => ({
	trpc: {
		service: {
			forServiceEditDrawer: { useQuery: vi.fn() },
			getOptions: { useQuery: vi.fn() },
			upsert: { useMutation: vi.fn() },
		},
		fieldOpt: {
			countryGovDistMap: { useQuery: vi.fn() },
			ccaMap: { useQuery: vi.fn() },
			attributesByCategory: { useQuery: vi.fn() },
		},
		organization: {
			attachAttribute: { useMutation: vi.fn() },
		},
		useUtils: vi.fn(),
	},
}))

const { trpc } = await import('~ui/lib/trpcClient')
const useForServiceEditDrawerMock = vi.mocked(trpc.service.forServiceEditDrawer.useQuery)
const useGetOptionsMock = vi.mocked(trpc.service.getOptions.useQuery)
const useUpsertMutationMock = vi.mocked(trpc.service.upsert.useMutation)
const useCountryGovDistMapMock = vi.mocked(trpc.fieldOpt.countryGovDistMap.useQuery)
const useCcaMapMock = vi.mocked(trpc.fieldOpt.ccaMap.useQuery)
const useAttributesByCategoryMock = vi.mocked(trpc.fieldOpt.attributesByCategory.useQuery)
const useAttachAttributeMutationMock = vi.mocked(trpc.organization.attachAttribute.useMutation)
const useUtilsMock = vi.mocked(trpc.useUtils)

const SERVICE_ID = 'osrv_TEST00000000000000000000'

describe('ServiceEditDrawer', () => {
	beforeEach(() => {
		useForServiceEditDrawerMock.mockReturnValue({
			data: {
				id: SERVICE_ID,
				published: true,
				deleted: false,
				attributes: [],
				description: { text: '', key: '', ns: '', crowdinId: null },
				name: { text: 'Test Service', key: '', ns: '', crowdinId: null },
				phones: [],
				emails: [],
				locations: [],
				hours: {},
				services: [],
				serviceAreas: null,
				accessDetails: [],
			},
			error: null,
			isPlaceholderData: false,
		} as never)
		useGetOptionsMock.mockReturnValue({ data: [] } as never)
		useCountryGovDistMapMock.mockReturnValue({ data: new Map() } as never)
		useCcaMapMock.mockReturnValue({ data: undefined } as never)
		useAttributesByCategoryMock.mockReturnValue({ data: undefined } as never)
		useAttachAttributeMutationMock.mockReturnValue({ mutate: vi.fn() } as never)
		useUtilsMock.mockReturnValue({
			location: { invalidate: vi.fn() },
			service: {
				invalidate: vi.fn(),
				forServiceEditDrawer: { invalidate: vi.fn() },
				forServiceModal: { invalidate: vi.fn() },
			},
		} as never)
	})

	it('always submits the live organizationId from useOrgInfo, even when the query data has none (the actual bug)', async () => {
		// Same bug class as EmailDrawer's `submitEmail` (see its test/comment): `organizationId` isn't
		// rendered as a field and isn't returned by this query - it must come from `useOrgInfo` fresh at
		// save time, not from form-tracked state, or a reopened drawer can submit a stale/missing value.
		const mutate = vi.fn()
		useUpsertMutationMock.mockReturnValue({ mutate, isPending: false } as never)

		const user = userEvent.setup()
		render(<ServiceEditDrawer serviceId={SERVICE_ID}>Edit service</ServiceEditDrawer>)
		await user.click(screen.getByRole('button', { name: 'Edit service' }))
		await waitFor(() => screen.getByRole('checkbox', { name: 'Deleted' }))
		await user.click(screen.getByRole('checkbox', { name: 'Deleted' }))
		await user.click(screen.getByRole('button', { name: 'Save' }))

		await waitFor(() => expect(mutate).toHaveBeenCalled())
		expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ organizationId: ORG_ID, deleted: true }))
	})
})
