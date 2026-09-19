import userEvent from '@testing-library/user-event'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

import { render, screen, waitFor } from '~ui/test/test-utils'

vi.mock('next/router', () => ({
	useRouter: () => ({ pathname: '/org/[slug]/edit', query: {}, push: vi.fn() }),
}))

/**
 * Simulates an async data-loading query (like `api.organization.forOrgPageEdits.useQuery`) that starts
 * `undefined` and resolves on a later tick, exactly like a real tRPC query would.
 */
const useFakeOrgQuery = () => {
	const [data, setData] = useState<{ id: string; name: string } | undefined>(undefined)
	useEffect(() => {
		const timer = setTimeout(() => setData({ id: 'orgn_real_id_123', name: 'Existing Org' }), 0)
		return () => clearTimeout(timer)
	}, [])
	return data
}

/**
 * Reproduces the actual reported bug in apps/app's src/pages/org/[slug]/edit.tsx: `useForm` was constructed
 * with `defaultValues: { id: data?.id, ... }`. `defaultValues` (a plain object) is only ever read once, on
 * this component instance's very first render - if the async org query hasn't resolved by that exact instant
 * (a real race, not a guaranteed win), `id` locks in as `undefined` forever, since nothing ever calls
 * `reset()`/`setValue()` once the real data arrives. Every save then submitted `id: undefined` to
 * `organization.updateBasic`, whose schema requires `id` - the request failed input validation server-side,
 * and the mutation's `onError` only rolled back the optimistic UI update with no user-facing error, matching
 * the reported "click Save, nothing happens, no errors." This reproduces the exact `getValues()` call the
 * page's `saveEvent.subscribe` callback makes.
 */
const BuggyOrgPageSim = ({ onSave }: { onSave: (values: { id?: string; name: string }) => void }) => {
	const data = useFakeOrgQuery()
	const formMethods = useForm<{ id?: string; name: string }>({
		defaultValues: { id: data?.id, name: data?.name ?? '' },
	})

	if (!data) {
		return <div>Loading...</div>
	}

	return (
		<form>
			<input {...formMethods.register('name')} aria-label='name' />
			<button type='button' onClick={() => onSave(formMethods.getValues())}>
				Save
			</button>
		</form>
	)
}

/** The fix: `values` (not `defaultValues`) reactively resyncs the form once `data` actually arrives. */
const FixedOrgPageSim = ({ onSave }: { onSave: (values: { id?: string; name: string }) => void }) => {
	const data = useFakeOrgQuery()
	const formMethods = useForm<{ id?: string; name: string }>({
		values: data ? { id: data.id, name: data.name } : undefined,
	})

	if (!data) {
		return <div>Loading...</div>
	}

	return (
		<form>
			<input {...formMethods.register('name')} aria-label='name' />
			<button type='button' onClick={() => onSave(formMethods.getValues())}>
				Save
			</button>
		</form>
	)
}

describe('org edit page - Save silently failing for every field (defaultValues vs values)', () => {
	it('BUGGY pattern: Save submits id: undefined even after the real org data has loaded', async () => {
		let captured: { id?: string; name: string } | undefined
		render(<BuggyOrgPageSim onSave={(v) => (captured = v)} />)

		await waitFor(() => expect(screen.getByLabelText('name')).toBeInTheDocument())
		await userEvent.type(screen.getByLabelText('name'), ' edited')
		await userEvent.click(screen.getByRole('button', { name: 'Save' }))

		// This is the bug: `id` never becomes the real org id, no matter how long it's been loaded.
		expect(captured?.id).toBeUndefined()
	})

	it('FIXED pattern: Save submits the real org id once the data has loaded', async () => {
		let captured: { id?: string; name: string } | undefined
		render(<FixedOrgPageSim onSave={(v) => (captured = v)} />)

		await waitFor(() => expect(screen.getByLabelText('name')).toBeInTheDocument())
		await userEvent.type(screen.getByLabelText('name'), ' edited')
		await userEvent.click(screen.getByRole('button', { name: 'Save' }))

		expect(captured?.id).toBe('orgn_real_id_123')
	})
})
