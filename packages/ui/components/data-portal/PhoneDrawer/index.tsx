import { zodResolver } from '@hookform/resolvers/zod'
import {
	Box,
	createPolymorphicComponent,
	Drawer,
	Group,
	LoadingOverlay,
	Modal,
	Stack,
	Text,
	Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { getExampleNumber } from 'libphonenumber-js'
import examples from 'libphonenumber-js/examples.mobile.json'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react'
import { type Resolver, useForm } from 'react-hook-form'
import { Checkbox, Select, TextInput } from 'react-hook-form-mantine'
import { isValidPhoneNumber } from 'react-phone-number-input'
import { z } from 'zod'

import { type TUpsertSchema } from '@weareinreach/api/router/orgPhone/mutation.upsert.schema'
import { generateId } from '@weareinreach/db/lib/idGen'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { PhoneNumberEntry } from '~ui/components/data-portal/PhoneNumberEntry/withHookForm'
import { useNewNotification } from '~ui/hooks/useNewNotification'
import { useOrgInfo } from '~ui/hooks/useOrgInfo'
import { isCountryCode } from '~ui/hooks/usePhoneNumber'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import classes from './index.module.css'

const FormSchema = z.object({
	id: z.string(),
	number: z.string(),
	ext: z.string().nullish(),
	primary: z.boolean().optional(),
	published: z.boolean(),
	deleted: z.boolean().default(false),
	countryId: z.string(),
	phoneTypeId: z.string().nullable(),
	description: z.string().nullable(),
	locationOnly: z.boolean().optional(),
	serviceOnly: z.boolean().optional(),
})
type FormSchema = z.infer<typeof FormSchema>
const _PhoneDrawer = forwardRef<HTMLButtonElement, PhoneDrawerProps>(
	({ id, createNew = false, ...props }, ref) => {
		const router = useRouter<'/org/[slug]/edit' | '/org/[slug]/[orgLocationId]/edit'>()
		const { t } = useTranslation(['phone-type'])
		const [drawerOpened, drawerHandler] = useDisclosure(false)
		const [modalOpened, modalHandler] = useDisclosure(false)
		// `drawerOpened` is a dependency so a "Create new" trigger gets a fresh id on every open, not
		// just once at mount - the trigger stays mounted (only this Drawer's open state toggles) once
		// the phone list already has an entry, so without this a second create would reuse the first
		// one's id and collide with it as a duplicate primary key. Edit mode (an `id` prop is passed)
		// is unaffected - it always returns that same `id` regardless of this dependency.
		const phoneId = useMemo(() => {
			if (createNew || !id) {
				return generateId('orgPhone')
			}
			return id
			// drawerOpened isn't read above - it's a deliberate recompute trigger, not a real dependency.
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [createNew, id, drawerOpened])
		const { id: orgId } = useOrgInfo()
		const apiUtils = api.useUtils()
		const notifySaveError = useNewNotification({
			displayText: 'Something went wrong saving this phone number. Please try again.',
			icon: 'warning',
		})
		const { data: initialData, isFetching } = api.orgPhone.forEditDrawer.useQuery(
			{ id: phoneId, orgId: orgId ?? '' },
			{
				// Never fires for a brand-new phone: `phoneId` here is only a client-generated id that
				// doesn't exist server-side yet, so this would resolve to `null` and cache that `null`
				// under the very id the create mutation goes on to reuse server-side. Left enabled, that
				// stale-cached `null` is what a later edit-drawer opened for the same (now real) phone
				// would see first - an empty form until something else happens to refetch it, which is
				// exactly the "just-created phone edits blank" bug this guards against.
				enabled: drawerOpened && !!orgId && !createNew,
				// `ext`/`description` come back `null` when unset - fed straight into `values` below,
				// that would hand a controlled TextInput a `null` value and trip React's
				// uncontrolled-to-controlled warning. `phoneTypeId` gets the same treatment for a
				// different reason: Mantine's `Select` treats a controlled value of `null` as "nothing
				// selected" (it blanks the closed input) regardless of whether `null` also appears as a
				// real option's `value` in `data` - so `null` can't work as the "Custom Text" sentinel.
				// `''` is used instead throughout the form; it's converted back to `null` at submission
				// time, below, to match what the API actually expects.
				select: (data) =>
					data
						? {
								...data,
								ext: data.ext ?? '',
								description: data.description ?? '',
								phoneTypeId: data.phoneTypeId ?? '',
							}
						: data,
			}
		)
		// No `initialData` here - combined with the client's 10-minute default `staleTime`, an
		// `initialData: []` would make react-query treat the query as already-fresh on mount and
		// never actually fetch, permanently stuck showing zero phone types.
		const { data: phoneTypes } = api.fieldOpt.phoneTypes.useQuery(undefined, {
			select: (data) => data.map(({ id: value, tsKey, tsNs }) => ({ value, label: t(tsKey, { ns: tsNs }) })),
		})
		// Same query PhoneNumberEntry already makes internally - React Query dedupes this against
		// that one rather than firing a second request, so this is free.
		const { data: countryList } = api.fieldOpt.countries.useQuery({ activeForOrgs: true })
		const countryCca2ById = useMemo(() => {
			const lookup = new Map<string, string>()
			countryList?.forEach(({ id: countryId, cca2 }) => lookup.set(countryId, cca2))
			return lookup
		}, [countryList])
		const countryNameById = useMemo(() => {
			const lookup = new Map<string, string>()
			countryList?.forEach(({ id: countryId, name }) => lookup.set(countryId, name))
			return lookup
		}, [countryList])

		// Built dynamically (rather than a module-level constant) because validating the phone
		// number requires resolving the selected countryId to an ISO country code first, and that
		// lookup table only exists once the countries query above has loaded. react-hook-form's
		// per-field `rules` are silently ignored whenever a resolver is set (this form uses one),
		// so the phone-format check has to live in the schema itself to actually run.
		const formResolver = useMemo(
			() =>
				zodResolver(
					FormSchema.superRefine((data, ctx) => {
						// A blank number previously passed validation silently (this check just returned),
						// which combined with the mutation having no onError handler meant a save with
						// nothing filled in would fail server-side with no visible feedback at all.
						if (!data.number) {
							ctx.addIssue({ code: 'custom', path: ['number'], message: 'Phone number is required' })
							return
						}
						const rawCca2 = countryCca2ById.get(data.countryId)
						const cca2 = rawCca2 && isCountryCode(rawCca2) ? rawCca2 : undefined
						if (!isValidPhoneNumber(data.number, cca2)) {
							if (!cca2) {
								ctx.addIssue({ code: 'custom', path: ['number'], message: 'Not a valid phone number' })
								return
							}
							const countryName = countryNameById.get(data.countryId) ?? cca2
							const example = getExampleNumber(cca2, examples)
							const message = example
								? `Not a valid phone number for ${countryName}. Example: ${example.formatNational()}`
								: `Not a valid phone number for ${countryName}`
							ctx.addIssue({ code: 'custom', path: ['number'], message })
						}
					})
				) as Resolver<FormSchema>,
			[countryCca2ById, countryNameById]
		)
		const { control, handleSubmit, formState, reset, watch } = useForm<FormSchema>({
			resolver: formResolver,
			values: initialData ?? undefined,
			// Without this, any background refetch of `forEditDrawer` that resolves while the drawer
			// is open - e.g. the one triggered by reopening it after an earlier save in the same
			// session, invalidated-but-not-yet-refetched until then - hands `values` a new object and
			// react-hook-form treats that as "sync the form to this," silently discarding whatever the
			// user had just changed and hadn't saved yet. `keepDirtyValues` makes that sync per-field:
			// untouched fields still pick up fresh server data, but a field the user has actually
			// edited keeps their edit instead of being overwritten out from under them.
			resetOptions: { keepDirtyValues: true },
			defaultValues: {
				id: phoneId,
				number: '',
				countryId: '',
				ext: '',
				phoneTypeId: '',
				description: '',
				published: true,
				deleted: false,
			},
		})
		const { isDirty: formIsDirty } = formState
		const [isSaved, setIsSaved] = useState(formIsDirty)
		const hasLocationId = typeof router.query.orgLocationId === 'string' ? router.query.orgLocationId : null

		// Never relies on re-reading the list from the database after a save - confirmed live (not
		// just theorized) that this API's underlying database can take longer than even two full,
		// cache-free page reloads to reflect a just-committed write, so a forced refetch right after
		// save can come back *without* the row just created or updated, silently reverting whatever
		// this function just did. Every field needed to show the row correctly is already sitting in
		// the submitted form values or this component's own already-loaded lookups (`countryCca2ById`,
		// `phoneTypes`), so there's no reason to ask the database again at all for the user's own
		// immediate feedback - a real (background, non-forcing) invalidate still runs afterward to
		// naturally correct anything this couldn't reconstruct (e.g. a custom phone type's exact
		// translation key) whenever the list is next freshly loaded.
		const patchContactListCaches = useCallback(
			(submitted: TUpsertSchema) => {
				// `update`'s zod branch technically allows every field but `id` to be omitted (only
				// `create` requires `number`/`countryId`), even though this drawer's form always
				// submits all of them - falling back to the existing cached value covers that gap
				// defensively rather than assuming the type's full possibility space away.
				const cca2 = submitted.countryId ? countryCca2ById.get(submitted.countryId) : undefined
				const matchedType = phoneTypes?.find(({ value }) => value === submitted.phoneTypeId)
				const parentIds = [orgId, hasLocationId].filter((value): value is string => Boolean(value))
				for (const parentId of parentIds) {
					apiUtils.orgPhone.forContactInfoEdit.setData({ parentId }, (old) => {
						if (!old) {
							return old
						}
						const existingIndex = old.findIndex((item) => item.id === submitted.id)
						const next =
							existingIndex === -1
								? [
										...old,
										{
											id: submitted.id ?? phoneId,
											number: submitted.number ?? '',
											ext: submitted.ext ?? null,
											primary: submitted.primary ?? false,
											locationOnly: submitted.locationOnly ?? false,
											published: submitted.published ?? true,
											deleted: submitted.deleted ?? false,
											// Falls back to '' only if `countryCca2ById` genuinely hasn't loaded a match
											// yet, which shouldn't happen for a real create (countryId is required) -
											// the list's own `country` field is always a plain string, never optional.
											country: cca2 ?? '',
											// No exact `{key, defaultText}` translation pair is available client-side
											// for a phone type (this drawer only has the already-translated label,
											// not its raw i18n key) - using the label for both makes `t(key, {ns,
											// defaultValue})`'s fallback resolve to the same visible text either way,
											// until a real refetch fills in the precise key.
											phoneType: matchedType
												? { key: matchedType.label, defaultText: matchedType.label }
												: null,
											description: submitted.description
												? { key: '', defaultText: submitted.description }
												: null,
										},
									]
								: old.map((item, index) =>
										index === existingIndex
											? {
													...item,
													number: submitted.number ?? item.number,
													ext: submitted.ext ?? item.ext,
													primary: submitted.primary ?? item.primary,
													locationOnly: submitted.locationOnly ?? item.locationOnly,
													published: submitted.published ?? item.published,
													deleted: submitted.deleted ?? item.deleted,
													country: cca2 ?? item.country,
													description:
														submitted.description === undefined
															? item.description
															: submitted.description === null
																? null
																: { key: item.description?.key ?? '', defaultText: submitted.description },
												}
											: item
									)
						return next.toSorted(
							(a, b) => Number(b.published) - Number(a.published) || Number(a.deleted) - Number(b.deleted)
						)
					})
				}
			},
			[apiUtils, orgId, hasLocationId, countryCca2ById, phoneTypes, phoneId]
		)

		// Same reasoning as `patchContactListCaches` above, applied to this drawer's *own* detail
		// query instead of the list: reopening this exact phone right after saving it - whether that
		// save was the initial create or any later edit - must not depend on a fresh read from the
		// same database that's already been shown to lag behind its own writes. Seeding this cache
		// directly from what was just submitted means the very next open (even immediately after
		// create, for a phone id that query has never successfully fetched before) shows the correct
		// values with no network request needed at all, instead of racing a real fetch against
		// however long this database takes to catch up.
		const seedEditDrawerCache = useCallback(
			(submitted: TUpsertSchema) => {
				const cca2 = submitted.countryId ? countryCca2ById.get(submitted.countryId) : undefined
				apiUtils.orgPhone.forEditDrawer.setData({ id: phoneId, orgId: orgId ?? '' }, (old) => ({
					id: phoneId,
					primary: submitted.primary ?? old?.primary ?? false,
					published: submitted.published ?? old?.published ?? true,
					deleted: submitted.deleted ?? old?.deleted ?? false,
					countryId: submitted.countryId ?? old?.countryId ?? '',
					phoneTypeId:
						submitted.phoneTypeId === undefined ? (old?.phoneTypeId ?? null) : submitted.phoneTypeId,
					locationOnly: submitted.locationOnly ?? old?.locationOnly ?? false,
					serviceOnly: submitted.serviceOnly ?? old?.serviceOnly ?? false,
					number: submitted.number ?? old?.number ?? '',
					ext: submitted.ext ?? old?.ext ?? null,
					description:
						submitted.description === undefined ? (old?.description ?? null) : submitted.description,
					orgId: orgId ?? '',
					country: cca2 ?? old?.country ?? '',
				}))
			},
			[apiUtils, orgId, phoneId, countryCca2ById]
		)

		// `orgPhone.upsert`'s `create` operation only ever connects the new phone to `organization` -
		// there's no location field on that schema at all, so creating this from a location's "Create
		// new" trigger needs a second, separate mutation to actually attach it to `orgLocationPhone`.
		// Without this, the new phone was only ever visible under the organization's own phone list,
		// never the location's, even though `hasLocationId`/`linkLocationId` looked like they already
		// captured that intent. Declared before `siteUpdate` below since its `onSuccess` calls this.
		const linkToLocation = api.orgPhone.locationLink.useMutation({
			onSuccess: () => apiUtils.orgPhone.forContactInfoEdit.invalidate(undefined, { refetchType: 'none' }),
		})
		const siteUpdate = api.orgPhone.upsert.useMutation({
			onSettled: (data, error, variables) => {
				// Guarded on success - `onSettled` fires on failure too, and patching from `variables`
				// (what the user *submitted*) rather than a server response means an unguarded call here
				// would show the edit as saved even when the write never reached the database at all,
				// with nothing to ever correct it since the caches are deliberately never force-refetched
				// (see the reasoning below). Email/Website/SocialMedia's equivalent patches already guard
				// the same way (they key off the mutation's own response, which is naturally `undefined`
				// on failure) - this one has to check `error` explicitly since it patches from the
				// request instead.
				if (!error) {
					patchContactListCaches(variables)
					seedEditDrawerCache(variables)
				}
				// Deliberately NOT invalidating `forContactInfoEdit`/`forEditDrawer` here, even with
				// `refetchType: 'none'` - live-confirmed real bug this used to cause: marking a query
				// stale doesn't itself refetch anything, but the *next* time it's naturally re-enabled
				// (e.g. `forEditDrawer` going disabled→enabled on this same drawer's next open, since
				// its query is gated by `drawerOpened`) react-query refetches automatically because the
				// data is stale - and that refetch reads from the same database confirmed to lag behind
				// its own writes. Unlike a refetch fired *immediately* after this save (already avoided,
				// see below), this one can happen anywhere from seconds to minutes later - reopening the
				// very drawer just saved - and was observed silently overwriting the just-patched,
				// correct cache with a still-lagging (pre-write) response, undoing the patch entirely.
				// The patch above is already the authoritative, correct value; leaving these two
				// unmarked lets them stay "fresh" for the normal staleTime window (~10 minutes,
				// ~ui/lib/trpcClient.ts) instead of inviting that race on every reopen. `forContactInfo`
				// below is different - it's never patched at all, so it has nothing to protect and
				// still needs an eventual (soft) refetch to pick up this change at all.
				apiUtils.orgPhone.forContactInfo.invalidate(undefined, { refetchType: 'none' })
				// Guarded on success - `reset()` (with or without a values argument) replaces the form's
				// current values outright, and calling it unconditionally here meant a failed save wiped
				// the user's just-typed, never-saved edit back to `defaultValues` with no way to recover
				// it, on top of giving no indication anything had gone wrong. On success, the mutation
				// returns the raw DB row, where an uncategorized/custom phone's `phoneTypeId` is a
				// genuine `null` - re-coerced to `''` here for the same reason as the `select` on the
				// query above (Mantine's `Select` can't use `null` as a real option's selected value).
				// `keepDirtyValues: false` overrides the form-level default (set below, to stop a
				// background refetch from clobbering an in-progress edit) - this reset is different:
				// it's applying what the user just successfully saved, so it should always win outright.
				if (data) {
					reset({ ...data, phoneTypeId: data.phoneTypeId ?? '' }, { keepDirtyValues: false })
				}
			},
			onSuccess: () => {
				setIsSaved(true)
				if (createNew && hasLocationId !== null) {
					linkToLocation.mutate({ orgPhoneId: phoneId, orgLocationId: hasLocationId, action: 'link' })
				}
				modalHandler.close()
				drawerHandler.close()
			},
			onError: () => {
				notifySaveError()
			},
		})
		const unlinkFromLocation = api.orgPhone.locationLink.useMutation({
			onSuccess: () => {
				drawerHandler.close()
				apiUtils.orgPhone.forContactInfoEdit.invalidate()
				// None of these three was invalidated at all before - the public (non-edit) list never
				// reflected an unlink, reopening this same phone's own drawer showed its pre-unlink
				// location association until an unrelated refetch happened to correct it, and (found via
				// a deliberate audit for this same class of gap, not a live report) the "Link or create
				// new..." menu kept omitting this phone from its options as if it were still linked,
				// since nothing ever told it the unlink had just happened.
				apiUtils.orgPhone.forContactInfo.invalidate()
				apiUtils.orgPhone.forEditDrawer.invalidate(
					{ id: phoneId, orgId: orgId ?? '' },
					{ refetchType: 'none' }
				)
				apiUtils.orgPhone.getLinkOptions.invalidate()
			},
		})
		// Runs on every open of a "Create new" trigger (not just at mount) - resets the form back to
		// blank defaults with the freshly-generated phoneId above. Without this, reopening the same
		// still-mounted trigger after a successful create would keep showing the phone that was just
		// created: onSettled's reset(data) (below) populates the form with that phone's values, and
		// react-hook-form's `values` sync only overrides state when there's real data to sync to, not
		// when the next open's query comes back empty for a brand-new id.
		useEffect(() => {
			if (createNew && drawerOpened) {
				// `keepDirtyValues: false` overrides the form-level default (set below) - this has to
				// fully clear the form even if a field was left dirty from whatever phone was open
				// before, since the whole point here is a guaranteed blank slate, not preserving
				// leftover edits.
				reset(
					{
						id: phoneId,
						number: '',
						countryId: '',
						ext: '',
						phoneTypeId: '',
						description: '',
						published: true,
						deleted: false,
					},
					{ keepDirtyValues: false }
				)
			}
		}, [createNew, drawerOpened, phoneId, hasLocationId, reset])
		useEffect(() => {
			if (isSaved && formIsDirty) {
				setIsSaved(false)
			}
		}, [formIsDirty, isSaved])

		const values = {
			phoneTypeId: watch('phoneTypeId'),
		}

		const handleClose = useCallback(() => {
			if (formIsDirty) {
				return modalHandler.open()
			} else {
				return drawerHandler.close()
			}
		}, [drawerHandler, formIsDirty, modalHandler])

		const handleUnlink = useCallback(() => {
			if (hasLocationId === null) {
				return
			}
			unlinkFromLocation.mutate({
				orgPhoneId: phoneId,
				orgLocationId: hasLocationId,
				action: 'unlink',
			})
		}, [hasLocationId, phoneId, unlinkFromLocation])

		// Shared by both save paths so the modal's Save button validates identically to the header's -
		// previously handleModalSave submitted via getValues() directly, skipping handleSubmit (and
		// therefore the zod resolver's phone-number-format check) entirely.
		const submitPhone = useCallback(
			(data: FormSchema) => {
				siteUpdate.mutate({
					orgId: orgId ?? '',
					operation: createNew ? 'create' : 'update',
					...data,
					phoneTypeId: data.phoneTypeId || null,
				})
			},
			[createNew, orgId, siteUpdate]
		)

		const handleSaveButton = useCallback(
			() => handleSubmit(submitPhone, (error) => console.error(error)),
			[handleSubmit, submitPhone]
		)

		const handleModalSave = useCallback(() => {
			void handleSubmit(submitPhone, (error) => console.error(error))()
		}, [handleSubmit, submitPhone])
		const handleCloseNoSave = useCallback(() => {
			// `keepDirtyValues: false`: "discard" has to actually discard every edit, not just the ones
			// the form-level default (set below) would otherwise leave untouched.
			reset(undefined, { keepDirtyValues: false })
			modalHandler.close()
			drawerHandler.close()
		}, [drawerHandler, modalHandler, reset])

		return (
			<>
				<Drawer.Root onClose={handleClose} opened={drawerOpened} position='right' zIndex={10001} keepMounted>
					<Drawer.Overlay />
					<Drawer.Content className={classes.drawerContent}>
						<form onSubmit={handleSaveButton()}>
							<Drawer.Header>
								<Group wrap='nowrap' justify='space-between' w='100%'>
									<Breadcrumb option='close' onClick={handleClose} />
									<Button
										variant='primary-icon'
										leftIcon={<Icon icon={isSaved ? 'carbon:checkmark' : 'carbon:save'} />}
										loading={siteUpdate.isPending}
										disabled={!formIsDirty}
										type='submit'
									>
										{isSaved ? 'Saved' : 'Save'}
									</Button>
								</Group>
							</Drawer.Header>
							<Drawer.Body>
								<LoadingOverlay visible={isFetching && !createNew} />
								<Stack gap={24} align='center'>
									<Title order={2}>{`${createNew ? 'Add New' : 'Edit'} Phone`}</Title>
									<Stack gap={24} align='flex-start' w='100%'>
										<PhoneNumberEntry
											// Forces a remount once the detail query's data actually arrives (and again if it
											// changes, e.g. after a save). PhoneNumberEntry's own `useController`/`useWatch`
											// subscriptions to this form's `number`/`countryId` fields don't reliably react to
											// a value applied via `reset()` *after* they've already mounted and subscribed -
											// this masked field then stays blank even though the form's own top-level
											// `watch()` correctly sees the new value (verified directly: react-hook-form
											// 7.85.0 here does update the field internally, it just doesn't notify this
											// specific child subscription). Mounting fresh instead of updating in place
											// sidesteps that gap entirely, since the value is already correct at mount time.
											key={`${phoneId}:${initialData?.number ?? ''}:${initialData?.countryId ?? ''}`}
											label='Phone Number'
											required
											countrySelect={{ name: 'countryId', comboboxProps: { zIndex: 10002 } }}
											phoneInput={{ name: 'number' }}
											// Drawer's own focus trap grabs the first focusable element as soon as it opens -
											// `data-autofocus` is Mantine's own escape hatch for that (checked by
											// `useFocusTrap` before it falls back to "first tabbable"), so this wins without
											// racing the trap the way a plain `setFocus` effect would.
											autoFocusNumber={createNew}
											control={control}
										/>
										<TextInput label='Extension' name='ext' control={control} />
										<Select
											label='Type'
											control={control}
											name='phoneTypeId'
											data={[...(phoneTypes ?? []), { value: '', label: 'Custom Text (enter below)' }]}
											comboboxProps={{ zIndex: 10002 }}
											withCheckIcon={false}
											classNames={{ option: classes.option }}
										/>
										{values.phoneTypeId === '' && (
											<TextInput
												label='Description'
												name='description'
												control={control}
												placeholder='Enter a custom description'
											/>
										)}
										<Stack w='100%' gap={16}>
											<Stack>
												<Checkbox label='Published' name='published' control={control} />
												<Checkbox label='Deleted' name='deleted' control={control} />
											</Stack>
											{hasLocationId !== null && (
												<Button
													leftIcon={<Icon icon='carbon:unlink' />}
													onClick={handleUnlink}
													disabled={createNew}
													fullWidth
												>
													Unlink from this location
												</Button>
											)}
										</Stack>
									</Stack>
								</Stack>
							</Drawer.Body>
							<Modal opened={modalOpened} onClose={modalHandler.close} title='Unsaved Changes' zIndex={10002}>
								<Stack align='center'>
									<Text>You have unsaved changes</Text>
									<Group wrap='nowrap'>
										<Button
											variant='primary-icon'
											leftIcon={<Icon icon='carbon:save' />}
											loading={siteUpdate.isPending}
											onClick={handleModalSave}
										>
											Save
										</Button>
										<Button variant='secondaryLg' onClick={handleCloseNoSave}>
											Discard
										</Button>
									</Group>
								</Stack>
							</Modal>
						</form>
					</Drawer.Content>
				</Drawer.Root>
				<Stack>
					<Box component='button' onClick={drawerHandler.open} ref={ref} {...props} />
				</Stack>
			</>
		)
	}
)
_PhoneDrawer.displayName = 'PhoneDrawer'

export const PhoneDrawer = createPolymorphicComponent<'button', PhoneDrawerProps>(_PhoneDrawer)

type PhoneDrawerProps = PhoneDrawerExisting | PhoneDrawerNew

interface PhoneDrawerExisting {
	id: string
	createNew?: never
}
interface PhoneDrawerNew {
	id?: never
	createNew: true
}
