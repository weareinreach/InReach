import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { act, fireEvent, render, screen, waitFor, within } from '~ui/test/test-utils'

const routerState: { query: Record<string, string> } = { query: {} }

vi.mock('next/router', () => ({
	useRouter: () => ({ query: routerState.query, pathname: '', push: vi.fn() }),
}))

vi.mock('~ui/hooks/useOrgInfo', () => ({
	useOrgInfo: () => ({ id: 'organization_test', slug: 'mock-org-slug' }),
}))

const countriesFixture = [
	{ id: 'country_us', cca2: 'US', name: 'United States', flag: '🇺🇸' },
	{ id: 'country_ca', cca2: 'CA', name: 'Canada', flag: '🇨🇦' },
	{ id: 'country_gb', cca2: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
]
const phoneTypesFixture = [
	{ value: 'phoneType_main', label: 'Main' },
	{ value: 'phoneType_fax', label: 'Fax' },
]

vi.mock('~ui/lib/trpcClient', () => ({
	trpc: {
		orgPhone: {
			forEditDrawer: { useQuery: vi.fn() },
			upsert: { useMutation: vi.fn() },
			locationLink: { useMutation: vi.fn() },
		},
		fieldOpt: {
			phoneTypes: { useQuery: vi.fn() },
			countries: { useQuery: vi.fn() },
		},
		useUtils: vi.fn(),
	},
}))

const { trpc } = await import('~ui/lib/trpcClient')
const { PhoneDrawer } = await import('./index')

const forEditDrawerMock = vi.mocked(trpc.orgPhone.forEditDrawer.useQuery)
const upsertMutationMock = vi.mocked(trpc.orgPhone.upsert.useMutation)
const locationLinkMutationMock = vi.mocked(trpc.orgPhone.locationLink.useMutation)
const phoneTypesMock = vi.mocked(trpc.fieldOpt.phoneTypes.useQuery)
const countriesMock = vi.mocked(trpc.fieldOpt.countries.useQuery)
const useUtilsMock = vi.mocked(trpc.useUtils)

const utilsStub = {
	orgPhone: {
		forContactInfoEdit: { invalidate: vi.fn(), setData: vi.fn() },
		forContactInfo: { invalidate: vi.fn() },
		forEditDrawer: { invalidate: vi.fn(), setData: vi.fn() },
	},
} as unknown as never

/** Existing, valid phone used across the "editing" tests. */
const existingPhone = {
	id: 'orgPhone_test',
	number: '+12025550179',
	ext: '',
	primary: false,
	published: true,
	deleted: false,
	countryId: 'country_us',
	phoneTypeId: 'phoneType_main',
	description: '',
	locationOnly: false,
	serviceOnly: false,
}

const setup = ({
	createNew,
	id = 'orgPhone_test',
	initialData = existingPhone,
	orgLocationId,
}: {
	createNew?: true
	id?: string
	initialData?: typeof existingPhone | null
	orgLocationId?: string
} = {}) => {
	routerState.query = orgLocationId ? { orgLocationId } : {}

	// utilsStub's mocks are module-scoped and shared across every test in this file (unlike
	// upsertMutate/locationLinkMutate, which are recreated fresh per setup() call) - clear their call
	// history here so a test checking "was invalidate called" isn't seeing a stale call from a
	// previous test.
	utilsStub.orgPhone.forContactInfoEdit.invalidate.mockClear()
	utilsStub.orgPhone.forContactInfoEdit.setData.mockClear()
	utilsStub.orgPhone.forContactInfo.invalidate.mockClear()
	utilsStub.orgPhone.forEditDrawer.invalidate.mockClear()
	utilsStub.orgPhone.forEditDrawer.setData.mockClear()

	forEditDrawerMock.mockReturnValue({ data: initialData, isFetching: false } as never)
	// Real hook applies `select`/no-select differently per call site - country data is used raw by
	// PhoneDrawer itself and transformed by PhoneNumberEntry, so the mock has to honor whichever
	// `select` (if any) the caller passed, the same way react-query actually would.
	countriesMock.mockImplementation(((
		_input: unknown,
		opts?: { select?: (d: typeof countriesFixture) => unknown }
	) => ({
		data: opts?.select ? opts.select(countriesFixture) : countriesFixture,
		isLoading: false,
	})) as never)
	phoneTypesMock.mockReturnValue({ data: phoneTypesFixture, isLoading: false } as never)
	useUtilsMock.mockReturnValue(utilsStub)

	const upsertMutate = vi.fn()
	upsertMutationMock.mockReturnValue({ mutate: upsertMutate, isPending: false } as never)

	const locationLinkMutate = vi.fn()
	locationLinkMutationMock.mockReturnValue({ mutate: locationLinkMutate, isPending: false } as never)

	const view = createNew
		? render(<PhoneDrawer createNew>Add New Phone</PhoneDrawer>)
		: render(<PhoneDrawer id={id}>Edit Phone</PhoneDrawer>)

	return { ...view, upsertMutate, locationLinkMutate }
}

/**
 * React-hook-form's isDirty compares against the last reset() baseline, not incrementally - a field that
 * returns to its original value looks "clean" again even without calling reset(). The real component only
 * advances that baseline via reset(data) in the mutation's onSettled callback, so a true multi-save cycle
 * test has to simulate that round trip after each save, or every other toggle silently disables the Save
 * button and never submits.
 */
const settleLastMutation = (payload: Record<string, unknown>) => {
	const options = upsertMutationMock.mock.calls.at(-1)?.[0] as {
		onSettled?: (data: unknown, error: null, variables: unknown) => void
	}
	act(() => {
		options.onSettled?.({ ...existingPhone, ...payload }, null, payload)
	})
}

const openDrawer = async () => {
	await userEvent.click(screen.getByRole('button', { name: /Add New Phone|Edit Phone/ }))
	await waitFor(() => expect(screen.getByRole('heading', { name: /Add New|Edit/ })).toBeInTheDocument())
}

describe('PhoneDrawer - opening and loading', () => {
	it('does not fire the detail query while the drawer is closed', () => {
		setup()
		expect(forEditDrawerMock).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({ enabled: false })
		)
	})

	it('fires the detail query once the drawer is opened', async () => {
		setup()
		await openDrawer()
		expect(forEditDrawerMock).toHaveBeenCalledWith(
			{ id: 'orgPhone_test', orgId: 'organization_test' },
			expect.objectContaining({ enabled: true })
		)
	})

	it('populates the form from the existing phone once opened', async () => {
		setup()
		await openDrawer()
		// PhoneNumberEntry displays the national-formatted value, not the raw E.164 it's fed.
		expect(screen.getByDisplayValue('(202) 555-0179')).toBeInTheDocument()
	})

	/**
	 * Regression test for a real reported bug: create a phone, then immediately click to edit the one just
	 * created - the edit form comes up blank, requiring a page refresh (sometimes two) to see the data. Root
	 * cause: this query is keyed by `phoneId`, a client-generated id used for both the "Create new" drawer's
	 * own (unnecessary) detail query _and_, later, the real created phone's id. Left enabled during createNew,
	 * this query fires for a phone that doesn't exist yet, gets back `null`, and caches that `null` under the
	 * very id the create mutation goes on to reuse server-side - so the next drawer opened to edit that same
	 * now-real phone sees the stale cached `null` first. The fix is to never run this query at all while
	 * createNew is true, since there's nothing to fetch for a phone that doesn't exist yet.
	 */
	it('never fires the detail query for a "Create new" drawer, even once opened', async () => {
		setup({ createNew: true, initialData: null })
		// forEditDrawerMock's call history isn't cleared between tests (only utilsStub's nested mocks
		// are) - clear it here so an `enabled: true` call left over from an earlier "editing" test
		// can't be mistaken for one made by this test's own createNew drawer.
		forEditDrawerMock.mockClear()
		await openDrawer()
		expect(forEditDrawerMock).not.toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({ enabled: true })
		)
	})
})

describe('PhoneDrawer - type / description field', () => {
	it('selecting a real phone type hides the Description field', async () => {
		setup()
		await openDrawer()
		expect(screen.queryByLabelText('Description')).not.toBeInTheDocument()
	})

	it('selecting Custom Text reveals the Description field', async () => {
		setup()
		await openDrawer()
		await userEvent.click(screen.getByRole('combobox', { name: 'Type' }))
		await userEvent.click(await screen.findByText('Custom Text (enter below)'))
		expect(screen.getByLabelText('Description')).toBeInTheDocument()
	})

	/**
	 * UI-side half of the phoneTypeId-clearing bug proven at the API layer in mutation.upsert.handler.test.ts -
	 * this confirms the _drawer_ correctly sends `null` (not that the server does anything sane with it, which
	 * is the separate, already-failing API test).
	 */
	it('sends phoneTypeId: null when Type is changed to Custom Text and saved', async () => {
		const { upsertMutate } = setup()
		await openDrawer()
		await userEvent.click(screen.getByRole('combobox', { name: 'Type' }))
		await userEvent.click(await screen.findByText('Custom Text (enter below)'))
		await userEvent.click(screen.getByRole('button', { name: /^Save$/ }))

		await waitFor(() => expect(upsertMutate).toHaveBeenCalled())
		const [payload] = upsertMutate.mock.calls[0] as [{ phoneTypeId: unknown }]
		expect(payload.phoneTypeId).toBeNull()
	})
})

describe('PhoneDrawer - publish / delete toggles', () => {
	it('unchecking Published sends published: false', async () => {
		const { upsertMutate } = setup()
		await openDrawer()
		await userEvent.click(screen.getByLabelText('Published'))
		await userEvent.click(screen.getByRole('button', { name: /^Save$/ }))

		await waitFor(() => expect(upsertMutate).toHaveBeenCalled())
		const [payload] = upsertMutate.mock.calls[0] as [{ published: unknown }]
		expect(payload.published).toBe(false)
	})

	it('checking Deleted sends deleted: true', async () => {
		const { upsertMutate } = setup()
		await openDrawer()
		await userEvent.click(screen.getByLabelText('Deleted'))
		await userEvent.click(screen.getByRole('button', { name: /^Save$/ }))

		await waitFor(() => expect(upsertMutate).toHaveBeenCalled())
		const [payload] = upsertMutate.mock.calls[0] as [{ deleted: unknown }]
		expect(payload.deleted).toBe(true)
	})

	it('four Published toggles in one session each save with whatever the current state is at that click', async () => {
		const { upsertMutate } = setup()
		await openDrawer()
		const checkbox = screen.getByLabelText('Published')
		const saveBtn = () => screen.getByRole('button', { name: /^Save$/ })

		for (let i = 0; i < 4; i++) {
			await userEvent.click(checkbox)
			await userEvent.click(saveBtn())
			await waitFor(() => expect(upsertMutate).toHaveBeenCalledTimes(i + 1))
			settleLastMutation(upsertMutate.mock.calls[i]![0] as Record<string, unknown>)
		}

		const published = upsertMutate.mock.calls.map(
			([payload]) => (payload as { published: unknown }).published
		)
		expect(published).toEqual([false, true, false, true])
	})

	it('Deleted toggled on then off across two saves sends true then false, not stale data', async () => {
		const { upsertMutate } = setup()
		await openDrawer()
		const checkbox = screen.getByLabelText('Deleted')
		const saveBtn = () => screen.getByRole('button', { name: /^Save$/ })

		for (let i = 0; i < 2; i++) {
			await userEvent.click(checkbox)
			await userEvent.click(saveBtn())
			await waitFor(() => expect(upsertMutate).toHaveBeenCalledTimes(i + 1))
			settleLastMutation(upsertMutate.mock.calls[i]![0] as Record<string, unknown>)
		}

		const deleted = upsertMutate.mock.calls.map(([payload]) => (payload as { deleted: unknown }).deleted)
		expect(deleted).toEqual([true, false])
	})

	it('a delete-then-undelete cycle does not corrupt Type, Extension, or Country', async () => {
		const { upsertMutate } = setup({ initialData: { ...existingPhone, ext: '789' } })
		await openDrawer()
		const checkbox = screen.getByLabelText('Deleted')
		const saveBtn = () => screen.getByRole('button', { name: /^Save$/ })

		await userEvent.click(checkbox)
		await userEvent.click(saveBtn())
		await waitFor(() => expect(upsertMutate).toHaveBeenCalledTimes(1))
		settleLastMutation(upsertMutate.mock.calls[0]![0] as Record<string, unknown>)

		await userEvent.click(checkbox)
		await userEvent.click(saveBtn())
		await waitFor(() => expect(upsertMutate).toHaveBeenCalledTimes(2))

		const undeletePayload = upsertMutate.mock.calls[1]![0] as Record<string, unknown>
		expect(undeletePayload.deleted).toBe(false)
		expect(undeletePayload.ext).toBe('789')
		expect(undeletePayload.phoneTypeId).toBe('phoneType_main')
		expect(undeletePayload.countryId).toBe('country_us')
	})

	it('toggling Published together with an unrelated field edit persists both changes in the same save', async () => {
		const { upsertMutate } = setup()
		await openDrawer()

		await userEvent.click(screen.getByLabelText('Published'))
		await userEvent.type(screen.getByLabelText('Extension'), '321')
		await userEvent.click(screen.getByRole('button', { name: /^Save$/ }))

		await waitFor(() => expect(upsertMutate).toHaveBeenCalledTimes(1))
		const [payload] = upsertMutate.mock.calls[0] as [{ published: unknown; ext: unknown }]
		expect(payload.published).toBe(false)
		expect(payload.ext).toBe('321')
	})

	it('delete-undelete repeated four times does not drift Type, Extension, or Country', async () => {
		const { upsertMutate } = setup({ initialData: { ...existingPhone, ext: '789' } })
		await openDrawer()
		const checkbox = screen.getByLabelText('Deleted')
		const saveBtn = () => screen.getByRole('button', { name: /^Save$/ })

		for (let i = 0; i < 4; i++) {
			await userEvent.click(checkbox)
			await userEvent.click(saveBtn())
			await waitFor(() => expect(upsertMutate).toHaveBeenCalledTimes(i + 1))
			settleLastMutation(upsertMutate.mock.calls[i]![0] as Record<string, unknown>)
		}

		for (const [payload] of upsertMutate.mock.calls as [Record<string, unknown>][]) {
			expect(payload.ext).toBe('789')
			expect(payload.phoneTypeId).toBe('phoneType_main')
			expect(payload.countryId).toBe('country_us')
		}
		const deletedSequence = upsertMutate.mock.calls.map(
			([payload]) => (payload as { deleted: unknown }).deleted
		)
		expect(deletedSequence).toEqual([true, false, true, false])
	})
})

describe('PhoneDrawer - malformed number fallback', () => {
	it('renders the raw-fallback input with its explanatory message for an unparseable number', async () => {
		setup({ initialData: { ...existingPhone, number: 'not-a-real-number' } })
		await openDrawer()

		expect(screen.getByDisplayValue('not-a-real-number')).toBeInTheDocument()
		expect(screen.getByText(/couldn.t be displayed in the normal format/i)).toBeInTheDocument()
	})

	it('a normally-formatted number does not trigger the raw-fallback message', async () => {
		setup()
		await openDrawer()
		expect(screen.queryByText(/couldn.t be displayed in the normal format/i)).not.toBeInTheDocument()
	})
})

describe('PhoneDrawer - auto-focus on create', () => {
	it('places the cursor in the phone number field as soon as a new phone drawer opens', async () => {
		setup({ createNew: true, initialData: null })
		await openDrawer()

		await waitFor(() => {
			expect(screen.getByRole('textbox', { name: /phone number/i })).toHaveFocus()
		})
	})

	it('does not steal focus back to the number field when reopening an existing phone for editing', async () => {
		setup()
		await openDrawer()

		expect(screen.getByRole('textbox', { name: /phone number/i })).not.toHaveFocus()
	})
})

/**
 * Regression tests for a real reported bug: typing the very first digit into a blank "Create new" phone
 * number field immediately kicked the cursor out of the field, requiring the user to click back in to keep
 * typing. Root cause: PhoneNumberEntry's raw-fallback effect (withHookForm.tsx) only guarded against
 * re-running on every keystroke, not against running on the _first_ keystroke of a brand-new number - a
 * single typed digit is always unparseable on its own, exactly as unparseable as genuinely broken legacy
 * data, so it satisfied the same "can't parse this" check that's meant to catch bad existing records. That
 * flipped the masked input to the raw-fallback plain text input - a real element swap, which unmounts the
 * original input and loses focus.
 */
describe('PhoneDrawer - typing a new number does not lose focus', () => {
	it('typing a brand-new number digit by digit never triggers the raw-fallback swap', async () => {
		setup({ createNew: true, initialData: null })
		await openDrawer()

		const numberInput = screen.getByRole('textbox', { name: /phone number/i })
		await userEvent.type(numberInput, '6508380114')

		expect(screen.queryByText(/couldn.t be displayed in the normal format/i)).not.toBeInTheDocument()
	})

	it('keeps focus in the phone number field while typing a brand-new number', async () => {
		setup({ createNew: true, initialData: null })
		await openDrawer()

		const numberInput = screen.getByRole('textbox', { name: /phone number/i })
		await userEvent.type(numberInput, '6')

		expect(numberInput).toHaveFocus()
	})
})

describe('PhoneDrawer - country auto-detect from typed number', () => {
	it('typing a number for a different country auto-switches the country selector', async () => {
		setup({ createNew: true, initialData: null })
		await openDrawer()

		// fireEvent.change rather than userEvent.type: the masked input reformats on every keystroke,
		// which races userEvent's per-character simulation and drops all but the last character typed.
		const numberInput = screen.getByRole('textbox', { name: /phone number/i })
		fireEvent.change(numberInput, { target: { value: '+442071234567' } })

		await waitFor(() => {
			const countryCombobox = screen.getAllByRole('combobox')[0] as HTMLInputElement
			expect(countryCombobox.value).toBe('🇬🇧')
		})
	})

	/**
	 * WithHookForm.tsx's auto-detect effect only switches the country Select when it can find the detected
	 * country in `countryList` (`countryList.find(({data}) => data.cca2 === phoneCountry)`). For a country
	 * outside the fixture's supported list, that lookup returns undefined and the whole `if (countryId)` block
	 * is skipped - no crash, no error, but also no feedback that the number implies a country the org can't
	 * select at all.
	 */
	it('does not crash or show an error when the typed number implies an unsupported country', async () => {
		setup({ createNew: true, initialData: null })
		await openDrawer()

		const numberInput = screen.getByRole('textbox', { name: /phone number/i })
		// +33 (France) is not in the test fixture's country list (only US/CA/GB).
		fireEvent.change(numberInput, { target: { value: '+33612345678' } })

		await waitFor(() => expect((numberInput as HTMLInputElement).value).not.toBe(''))
		const countryCombobox = screen.getAllByRole('combobox')[0] as HTMLInputElement
		expect(countryCombobox.value).toBe('')
		expect(screen.queryByText(/country not enabled/i)).not.toBeInTheDocument()
	})
})

describe('PhoneDrawer - extension', () => {
	it('includes a typed extension in the saved payload', async () => {
		const { upsertMutate } = setup()
		await openDrawer()
		await userEvent.type(screen.getByLabelText('Extension'), '123')
		await userEvent.click(screen.getByRole('button', { name: /^Save$/ }))

		await waitFor(() => expect(upsertMutate).toHaveBeenCalled())
		const [payload] = upsertMutate.mock.calls[0] as [{ ext: unknown }]
		expect(payload.ext).toBe('123')
	})

	it('sends an empty string, not null or undefined, when an extension is cleared', async () => {
		const { upsertMutate } = setup({ initialData: { ...existingPhone, ext: '456' } })
		await openDrawer()
		await userEvent.clear(screen.getByLabelText('Extension'))
		await userEvent.click(screen.getByRole('button', { name: /^Save$/ }))

		await waitFor(() => expect(upsertMutate).toHaveBeenCalled())
		const [payload] = upsertMutate.mock.calls[0] as [{ ext: unknown }]
		expect(payload.ext).toBe('')
	})
})

describe('PhoneDrawer - save button dirty state', () => {
	it('is disabled while the form is pristine', async () => {
		setup()
		await openDrawer()
		expect(screen.getByRole('button', { name: /^Save$/ })).toBeDisabled()
	})

	it('is enabled once a field changes', async () => {
		setup()
		await openDrawer()
		await userEvent.click(screen.getByLabelText('Published'))
		expect(screen.getByRole('button', { name: /^Save$/ })).toBeEnabled()
	})
})

describe('PhoneDrawer - close / unsaved changes', () => {
	it('closes immediately with no changes, without showing the unsaved-changes modal', async () => {
		setup()
		await openDrawer()
		await userEvent.click(screen.getByRole('button', { name: /close/i }))
		expect(screen.queryByText('Unsaved Changes')).not.toBeInTheDocument()
	})

	it('shows the Unsaved Changes modal when closing after an edit', async () => {
		setup()
		await openDrawer()
		await userEvent.click(screen.getByLabelText('Published'))
		await userEvent.click(screen.getByRole('button', { name: /close/i }))
		expect(await screen.findByText('Unsaved Changes')).toBeInTheDocument()
	})

	/**
	 * Desired behavior: the modal's own Save button should validate exactly like the header Save button does.
	 * Currently fails: handleModalSave submits via getValues() directly instead of handleSubmit(), so it never
	 * runs the zod resolver's phone-number-format check at all. Uses a number that's structurally well-formed
	 * (so PhoneNumberEntry's own "can't parse this at all" raw-fallback path never kicks in) but fails this
	 * app's own isValidPhoneNumber(number, 'US') check, isolating this from PhoneNumberEntry's unrelated
	 * malformed-input handling.
	 */
	it('the Unsaved Changes modal Save button rejects an invalid phone number, same as the header Save button would', async () => {
		const { upsertMutate } = setup({ initialData: { ...existingPhone, number: '+15555550100' } })
		await openDrawer()
		await userEvent.click(screen.getByLabelText('Published'))
		await userEvent.click(screen.getByRole('button', { name: /close/i }))
		const modal = await screen.findByRole('dialog', { name: 'Unsaved Changes' })
		await userEvent.click(within(modal).getByRole('button', { name: /^Save$/ }))

		expect(upsertMutate).not.toHaveBeenCalled()
	})
})

describe('PhoneDrawer - sequential create (duplicate-id suspicion)', () => {
	/**
	 * Desired behavior: each open of a "Create new" trigger should get its own distinct id - reusing one across
	 * two separate phones would mean the second create collides with the first's primary key. Currently fails:
	 * `phoneId = useMemo(() => generateId('orgPhone'), [createNew, id])` (PhoneDrawer/index.tsx:55-60) only
	 * recomputes when its deps change, and for a "Create new" trigger, `createNew` and `id` never change across
	 * repeated opens of the _same mounted_ trigger instance. In production, that trigger stays mounted once the
	 * phone list already has at least one entry (only its Drawer's open state toggles), so a second "Create
	 * new" click reuses the first click's generated id. This test opens, closes, and reopens the same rendered
	 * trigger (no unmount in between) and checks whether the detail query - keyed by phoneId - gets a fresh
	 * id.
	 */
	it('generates a fresh id on each separate open of the same "Create new" trigger', async () => {
		setup({ createNew: true, initialData: null })
		await openDrawer()
		const firstId = (forEditDrawerMock.mock.calls.at(-1)?.[0] as { id: string }).id

		await userEvent.click(screen.getByRole('button', { name: /close/i }))
		await waitFor(() => expect(screen.queryByRole('heading', { name: /Add New/ })).not.toBeInTheDocument())

		await openDrawer()
		const secondId = (forEditDrawerMock.mock.calls.at(-1)?.[0] as { id: string }).id

		expect(secondId).not.toBe(firstId)
	})

	it('creating phone B right after a successful phone A submits a distinct id in the actual payload', async () => {
		const { upsertMutate } = setup({ createNew: true, initialData: null })
		await openDrawer()

		const firstNumberInput = screen.getByRole('textbox', { name: /phone number/i })
		fireEvent.change(firstNumberInput, { target: { value: '+12025550179' } })
		await waitFor(() => {
			expect((screen.getAllByRole('combobox')[0] as HTMLInputElement).value).toBe('🇺🇸')
		})
		await userEvent.click(screen.getByRole('button', { name: /^Save$/ }))
		await waitFor(() => expect(upsertMutate).toHaveBeenCalledTimes(1))
		const firstPayload = upsertMutate.mock.calls[0]![0] as { id: string }

		// Simulate the real success round trip: onSettled resets the form, onSuccess closes the drawer.
		const options = upsertMutationMock.mock.calls.at(-1)?.[0] as {
			onSuccess?: () => void
			onSettled?: (data: unknown, error: null, variables: unknown) => void
		}
		act(() => {
			options.onSettled?.(firstPayload, null, firstPayload)
			options.onSuccess?.()
		})

		// Reopen the same still-mounted trigger for "phone B."
		await openDrawer()
		const secondNumberInput = screen.getByRole('textbox', { name: /phone number/i })
		fireEvent.change(secondNumberInput, { target: { value: '+14155552671' } })
		await waitFor(() => {
			expect((screen.getAllByRole('combobox')[0] as HTMLInputElement).value).toBe('🇺🇸')
		})
		await userEvent.click(screen.getByRole('button', { name: /^Save$/ }))
		await waitFor(() => expect(upsertMutate).toHaveBeenCalledTimes(2))
		const secondPayload = upsertMutate.mock.calls[1]![0] as { id: string }

		expect(secondPayload.id).not.toBe(firstPayload.id)
	})
})

describe('PhoneDrawer - create success side effects', () => {
	const fillAndSaveNewPhone = async (upsertMutate: ReturnType<typeof vi.fn>) => {
		const numberInput = screen.getByRole('textbox', { name: /phone number/i })
		fireEvent.change(numberInput, { target: { value: '+12025550179' } })
		await waitFor(() => {
			expect((screen.getAllByRole('combobox')[0] as HTMLInputElement).value).toBe('🇺🇸')
		})
		await userEvent.click(screen.getByRole('button', { name: /^Save$/ }))
		await waitFor(() => expect(upsertMutate).toHaveBeenCalledTimes(1))
	}

	/**
	 * Live-confirmed bug this replaces an outdated test for: a real (forced) refetch right after create asks
	 * the same database the write just went to, and that read is not guaranteed to reflect the write yet -
	 * confirmed directly against a real backend, not just theorized. Forcing one anyway risks it coming back
	 * without the new phone and silently overwriting the correct cache write below with a stale list. The fix
	 * writes the new phone into the cache directly from what was actually submitted, and only _marks_ the query
	 * stale (`refetchType: 'none'`) rather than forcing an immediate re-read - the previous version of this
	 * test asserted the opposite (a forced `invalidate()` with no options) as the desired behavior, which was
	 * the bug.
	 */
	it('a successful create writes the new phone into the cached list directly, without waiting on a server re-read', async () => {
		const { upsertMutate } = setup({ createNew: true, initialData: null })
		await openDrawer()
		await fillAndSaveNewPhone(upsertMutate)

		const submitted = upsertMutate.mock.calls[0]![0] as { id: string; number: string }
		const options = upsertMutationMock.mock.calls.at(-1)?.[0] as {
			onSuccess?: () => void
			onSettled?: (data: unknown, error: null, variables: unknown) => void
		}
		act(() => {
			options.onSettled?.(submitted, null, submitted)
			options.onSuccess?.()
		})

		// The list is never force-refetched from the server for this - only patched directly, then
		// marked stale for whenever it's next naturally reloaded.
		expect(utilsStub.orgPhone.forContactInfoEdit.invalidate).toHaveBeenCalledWith(undefined, {
			refetchType: 'none',
		})

		const setDataCall = utilsStub.orgPhone.forContactInfoEdit.setData.mock.calls.find(
			(call) => (call[0] as { parentId: string }).parentId === 'organization_test'
		) as [{ parentId: string }, (old: unknown) => { id: string; number: string }[]]
		expect(setDataCall).toBeDefined()
		const patched = setDataCall[1]([existingPhone])
		expect(patched.map((item) => item.id)).toContain(submitted.id)
		expect(patched.find((item) => item.id === submitted.id)?.number).toBe(submitted.number)
	})

	/**
	 * Desired behavior: reopening the same still-mounted "Create new" trigger should show a blank form, ready
	 * for the next new phone. Currently fails - same root cause as the phoneId-reuse bug (#40) surfacing a
	 * second way: onSettled's reset(data) repopulates the form with the just-created phone's values, and since
	 * phoneId never changes for this trigger instance, nothing ever clears it back to blank defaults on the
	 * next open.
	 */
	it('reopening the same "Create new" trigger after a successful create shows a blank form, not the previous phone\'s data', async () => {
		const { upsertMutate } = setup({ createNew: true, initialData: null })
		await openDrawer()
		await fillAndSaveNewPhone(upsertMutate)

		const options = upsertMutationMock.mock.calls.at(-1)?.[0] as {
			onSuccess?: () => void
			onSettled?: (data: unknown, error: null, variables: unknown) => void
		}
		act(() => {
			options.onSettled?.(upsertMutate.mock.calls[0]![0], null, upsertMutate.mock.calls[0]![0])
			options.onSuccess?.()
		})

		await openDrawer()
		expect(screen.queryByDisplayValue('(202) 555-0179')).not.toBeInTheDocument()
		expect(screen.getByRole('textbox', { name: /phone number/i })).toHaveValue('')
	})
})

describe('PhoneDrawer - creating with Published unchecked', () => {
	it('respects Published unchecked at create time, not just on a later edit', async () => {
		const { upsertMutate } = setup({ createNew: true, initialData: null })
		await openDrawer()

		await userEvent.click(screen.getByLabelText('Published'))
		const numberInput = screen.getByRole('textbox', { name: /phone number/i })
		fireEvent.change(numberInput, { target: { value: '+12025550179' } })
		await waitFor(() => {
			expect((screen.getAllByRole('combobox')[0] as HTMLInputElement).value).toBe('🇺🇸')
		})
		await userEvent.click(screen.getByRole('button', { name: /^Save$/ }))

		await waitFor(() => expect(upsertMutate).toHaveBeenCalledTimes(1))
		const [payload] = upsertMutate.mock.calls[0] as [{ operation: unknown; published: unknown }]
		expect(payload.operation).toBe('create')
		expect(payload.published).toBe(false)
	})
})

describe('PhoneDrawer - blank submission is blocked', () => {
	/**
	 * The header Save button's blank-number case is already blocked before this fix even runs: the phone number
	 * input carries a real HTML `required` attribute, so the browser's native form validation refuses to
	 * dispatch the submit event at all when it's empty - neither handleSubmit's onValid nor onInvalid ever
	 * fires, confirmed by instrumenting both. That's a separate, pre-existing protection, not this fix - kept
	 * here as its own regression test since removing `required` from PhoneNumberEntry later would silently lose
	 * it.
	 */
	it('the header Save button never submits when the phone number is empty (native required attribute)', async () => {
		const { upsertMutate } = setup({ createNew: true, initialData: null })
		await openDrawer()

		await userEvent.click(screen.getByLabelText('Published'))
		await userEvent.click(screen.getByRole('button', { name: /^Save$/ }))
		await new Promise((resolve) => setTimeout(resolve, 0))

		expect(upsertMutate).not.toHaveBeenCalled()
	})

	/**
	 * This is the path the fix actually matters for: handleModalSave calls handleSubmit() as a plain JS
	 * function rather than through a real form-submit event, which bypasses the browser's native `required`
	 * validation entirely. Before this fix, the superRefine's `if (!data.number) return` let a blank number
	 * straight through this path with no validation at all. Confirmed the message genuinely renders here
	 * (unlike the header path above, where native validation intercepts first and no React validation ever
	 * runs).
	 */
	it('the Unsaved Changes modal Save button shows "Phone number is required" and does not submit when blank', async () => {
		const { upsertMutate } = setup({ createNew: true, initialData: null })
		await openDrawer()

		await userEvent.click(screen.getByLabelText('Published'))
		await userEvent.click(screen.getByRole('button', { name: /close/i }))
		const modal = await screen.findByRole('dialog', { name: 'Unsaved Changes' })
		await userEvent.click(within(modal).getByRole('button', { name: /^Save$/ }))

		expect(await screen.findByText('Phone number is required')).toBeInTheDocument()
		expect(upsertMutate).not.toHaveBeenCalled()
	})
})

describe('PhoneDrawer - deleted phone remains editable', () => {
	it('a deleted phone is still reachable and editable from its own drawer, not hidden entirely', async () => {
		setup({ initialData: { ...existingPhone, deleted: true } })
		await openDrawer()

		expect(screen.getByLabelText('Deleted')).toBeChecked()
		expect(screen.getByDisplayValue('(202) 555-0179')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /^Save$/ })).toBeInTheDocument()
	})
})

describe('PhoneDrawer - rapid double-save', () => {
	/**
	 * A plain userEvent.dblClick can't actually test this: it fires both clicks against one static mocked
	 * isPending value, so it can only prove there's no _form-dirty_-based lock - it can't see whether the
	 * button disables once a save is genuinely in flight. Mantine's own Button merges `loading` into its
	 * `disabled` state (`disabled: disabled || loading` in Button.cjs), and both Save buttons already pass
	 * `loading={siteUpdate.isPending}` - so the real question is whether that's enough once isPending actually
	 * flips to true, which this test simulates directly via a rerender rather than relying on two rapid-fire
	 * mocked-identical clicks.
	 */
	it('the Save button disables while a save is genuinely in flight, blocking a second submission', async () => {
		const { upsertMutate, rerender } = setup()
		await openDrawer()
		await userEvent.click(screen.getByLabelText('Published'))

		upsertMutationMock.mockReturnValue({ mutate: upsertMutate, isPending: true } as never)
		rerender(<PhoneDrawer id='orgPhone_test'>Edit Phone</PhoneDrawer>)

		const saveBtn = screen.getByRole('button', { name: /^Save$/ })
		expect(saveBtn).toBeDisabled()

		await userEvent.click(saveBtn)
		expect(upsertMutate).not.toHaveBeenCalled()
	})
})

describe('PhoneDrawer - two independent phone instances (cross-contamination)', () => {
	const phoneA = { ...existingPhone, id: 'orgPhone_a', number: '+12025550179' }
	const phoneB = { ...existingPhone, id: 'orgPhone_b', number: '+14155552671', ext: '999' }

	const renderTwoInstances = () => {
		utilsStub.orgPhone.forContactInfoEdit.invalidate.mockClear()
		utilsStub.orgPhone.forContactInfoEdit.setData.mockClear()

		// forEditDrawerMock has to branch on the queried id here - a single static mockReturnValue
		// would make both instances show identical data regardless of which one queried, which would
		// make this test pass or fail based on a mock artifact rather than the real component.
		forEditDrawerMock.mockImplementation(((input: { id: string }) => ({
			data: input.id === phoneA.id ? phoneA : input.id === phoneB.id ? phoneB : null,
			isFetching: false,
		})) as never)
		countriesMock.mockImplementation(((
			_input: unknown,
			opts?: { select?: (d: typeof countriesFixture) => unknown }
		) => ({
			data: opts?.select ? opts.select(countriesFixture) : countriesFixture,
			isLoading: false,
		})) as never)
		phoneTypesMock.mockReturnValue({ data: phoneTypesFixture, isLoading: false } as never)
		useUtilsMock.mockReturnValue(utilsStub)
		const upsertMutate = vi.fn()
		upsertMutationMock.mockReturnValue({ mutate: upsertMutate, isPending: false } as never)
		locationLinkMutationMock.mockReturnValue({ mutate: vi.fn(), isPending: false } as never)

		render(
			<>
				<PhoneDrawer id={phoneA.id}>Edit Phone A</PhoneDrawer>
				<PhoneDrawer id={phoneB.id}>Edit Phone B</PhoneDrawer>
			</>
		)
		return { upsertMutate }
	}

	/**
	 * Drawer.Root's `keepMounted` means BOTH instances' form fields exist in the DOM at once, regardless of
	 * which one was actually clicked open - a generic query like getByLabelText ('Published') matches one
	 * checkbox per instance and throws on ambiguity. Scoping via `within()`, anchored on each drawer's own
	 * uniquely-valued number field, is required throughout.
	 */
	const getDialogByNumber = (formattedNumber: string) =>
		screen.getByDisplayValue(formattedNumber).closest('[role="dialog"]') as HTMLElement

	it("opening phone A shows only A's data; opening phone B afterward (both mounted) shows only B's", async () => {
		renderTwoInstances()

		await userEvent.click(screen.getByRole('button', { name: 'Edit Phone A' }))
		const dialogA = getDialogByNumber('(202) 555-0179')
		expect(within(dialogA).getByDisplayValue('(202) 555-0179')).toBeInTheDocument()

		await userEvent.click(screen.getByRole('button', { name: 'Edit Phone B' }))
		const dialogB = getDialogByNumber('(415) 555-2671')
		expect(within(dialogB).getByLabelText('Extension')).toHaveValue('999')
		// A's own dialog still shows A's data, unaffected by B having been opened too.
		expect(within(dialogA).getByDisplayValue('(202) 555-0179')).toBeInTheDocument()
	})

	it("saving phone A does not send phone B's data", async () => {
		const { upsertMutate } = renderTwoInstances()

		await userEvent.click(screen.getByRole('button', { name: 'Edit Phone A' }))
		const dialogA = getDialogByNumber('(202) 555-0179')
		await userEvent.click(within(dialogA).getByLabelText('Published'))
		await userEvent.click(within(dialogA).getByRole('button', { name: /^Save$/ }))

		await waitFor(() => expect(upsertMutate).toHaveBeenCalledTimes(1))
		const [payloadA] = upsertMutate.mock.calls[0] as [{ id: string; ext: unknown }]
		expect(payloadA.id).toBe(phoneA.id)
		expect(payloadA.ext).toBe('')
	})

	it("patching the shared list cache after phone A saves only updates phone A's row, not phone B's", async () => {
		const { upsertMutate } = renderTwoInstances()

		await userEvent.click(screen.getByRole('button', { name: 'Edit Phone A' }))
		const dialogA = getDialogByNumber('(202) 555-0179')
		await userEvent.click(within(dialogA).getByLabelText('Published'))
		await userEvent.click(within(dialogA).getByRole('button', { name: /^Save$/ }))
		await waitFor(() => expect(upsertMutate).toHaveBeenCalledTimes(1))

		const options = upsertMutationMock.mock.calls.at(-1)?.[0] as {
			onSettled?: (data: unknown, error: null, variables: unknown) => void
		}
		const submittedA = upsertMutate.mock.calls[0]![0] as Record<string, unknown>
		act(() => {
			options.onSettled?.({ ...phoneA, ...submittedA }, null, submittedA)
		})

		const setDataCall = utilsStub.orgPhone.forContactInfoEdit.setData.mock.calls.at(-1) as [
			unknown,
			(old: Array<{ id: string; published: boolean }>) => unknown,
		]
		const patched = setDataCall[1]([
			{ id: phoneA.id, published: true, deleted: false },
			{ id: phoneB.id, published: true, deleted: false },
		]) as Array<{ id: string; published: boolean }>

		expect(patched.find((p) => p.id === phoneA.id)?.published).toBe(false)
		expect(patched.find((p) => p.id === phoneB.id)?.published).toBe(true)
	})
})

describe('PhoneDrawer - unlink from location', () => {
	it('shows the unlink button when editing a phone opened from a location context', async () => {
		setup({ orgLocationId: 'orgLocation_test' })
		await openDrawer()
		expect(screen.getByRole('button', { name: /unlink from this location/i })).toBeInTheDocument()
	})

	it('does not show the unlink button when there is no location context', async () => {
		setup()
		await openDrawer()
		expect(screen.queryByRole('button', { name: /unlink from this location/i })).not.toBeInTheDocument()
	})

	it('clicking unlink calls locationLink with action: unlink and the correct ids', async () => {
		const { locationLinkMutate } = setup({ orgLocationId: 'orgLocation_test' })
		await openDrawer()
		await userEvent.click(screen.getByRole('button', { name: /unlink from this location/i }))

		expect(locationLinkMutate).toHaveBeenCalledWith({
			orgPhoneId: 'orgPhone_test',
			orgLocationId: 'orgLocation_test',
			action: 'unlink',
		})
	})
})
