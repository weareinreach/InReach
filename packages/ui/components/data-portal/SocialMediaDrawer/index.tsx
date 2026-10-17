import { zodResolver } from '@hookform/resolvers/zod'
import {
	Box,
	type ComboboxItem,
	type ComboboxLikeRenderOptionInput,
	createPolymorphicComponent,
	Drawer,
	Group,
	LoadingOverlay,
	Modal,
	Stack,
	Text,
	Title,
} from '@mantine/core'
import { useDebouncedValue, useDisclosure } from '@mantine/hooks'
import { useRouter } from 'next/router'
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react'
import { type Resolver, useForm } from 'react-hook-form'
import { Checkbox, Select, TextInput } from 'react-hook-form-mantine'
import SocialLinks from 'social-links'
import { z } from 'zod'

import { type ApiOutput } from '@weareinreach/api'
import { prefixedId } from '@weareinreach/api/schemas/idPrefix'
import { generateId } from '@weareinreach/db/lib/idGen'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { useNewNotification } from '~ui/hooks/useNewNotification'
import { useOrgInfo } from '~ui/hooks/useOrgInfo'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import classes from './index.module.css'

type SocialMediaRow = NonNullable<ApiOutput['orgSocialMedia']['upsert']>

const socialLinkValidator = new SocialLinks()

const FormSchema = z.object({
	id: prefixedId('orgSocialMedia'),
	username: z.string(),
	url: z.string(),
	published: z.boolean().default(true),
	deleted: z.boolean().default(false),
	serviceId: z.string(),
	organizationId: prefixedId('organization').nullable(),
	orgLocationOnly: z.boolean().default(false),
	service: z
		.object({
			id: prefixedId('socialMediaService'),
			name: z.string(),
			logoIcon: z.string(),
		})
		.optional(),
	orgLocationId: z.string().nullish(),
})
type FormSchema = z.infer<typeof FormSchema>

const _SocialMediaDrawer = forwardRef<HTMLButtonElement, SocialMediaDrawerProps>(
	({ id, createNew, ...props }, ref) => {
		const router = useRouter<'/org/[slug]/edit' | '/org/[slug]/[orgLocationId]/edit'>()
		const { id: organizationId } = useOrgInfo()
		const [drawerOpened, drawerHandler] = useDisclosure(false)
		const [modalOpened, modalHandler] = useDisclosure(false)
		// `drawerOpened` is a dependency so a "Create new" trigger gets a fresh id on every open, not
		// just once at mount - the trigger stays mounted (only this Drawer's open state toggles) once
		// the social media list already has an entry, so without this a second create would reuse the
		// first one's id, and now that `onSettled` below patches `forEditDrawer`'s cache under that id,
		// the reused id would read back the first item's own cached data instead of starting blank
		// (confirmed live - this is what broke a second "Create new" open, cascading into the drawer's
		// Close button no longer working either). Edit mode (an `id` prop is passed) is unaffected - it
		// always returns that same `id` regardless of this dependency.
		const socialId = useMemo(
			() => (createNew ? generateId('orgSocialMedia') : id),
			// eslint-disable-next-line react-hooks/exhaustive-deps
			[createNew, id, drawerOpened]
		)
		const { data, isFetching } = api.orgSocialMedia.forEditDrawer.useQuery(
			{ id: socialId },
			{ enabled: drawerOpened && !createNew }
		)
		const {
			control,
			handleSubmit,
			formState,
			reset,
			getValues,
			setValue: setFormValue,
			watch,
		} = useForm<FormSchema>({
			resolver: zodResolver(FormSchema) as Resolver<FormSchema>,
			values: data ?? undefined,
		})
		const apiUtils = api.useUtils()
		const { data: socialMediaServices } = api.orgSocialMedia.getServiceTypes.useQuery(undefined, {
			select: (serviceTypeData) =>
				serviceTypeData
					? serviceTypeData.map(({ id: value, name, logoIcon }) => ({
							value,
							label: name,
							icon: <Icon icon={logoIcon} />,
							// Raw `name`/`logoIcon` kept alongside the already-rendered `icon`/translated
							// `label` above - needed to patch `forContactInfoEdits`'s `service`/`serviceIcon`
							// string fields and `forEditDrawer`'s `service: {id, name, logoIcon}` object below,
							// neither of which wants a React element.
							name,
							logoIcon,
						}))
					: [],
			placeholderData: [],
		})

		const { isDirty: formIsDirty } = formState
		const [isSaved, setIsSaved] = useState(formIsDirty)
		const notifySave = useNewNotification({ displayText: 'Saved', icon: 'success' })
		const notifySaveError = useNewNotification({
			displayText: 'Something went wrong saving this social media link. Please try again.',
			icon: 'warning',
		})
		const hasLocationId = typeof router.query.orgLocationId === 'string' ? router.query.orgLocationId : null

		// `upsert`'s response is the raw DB row (`serviceId` as a bare FK, no resolved name/icon) - it
		// also always reflects what's actually persisted, which matters specifically for an `update`:
		// the handler only ever writes `published`/`deleted`/`orgLocationOnly` on that branch (url,
		// username, and service are create-only), so building this patch from `data` rather than the
		// submitted form values can't accidentally show a url/username/service edit that the server
		// silently ignored. Never waits on a real refetch to patch these caches - this API's underlying
		// database has been confirmed live to lag behind its own writes (see PhoneDrawer for the fuller
		// account), so a forced immediate re-read right after save risks coming back without the change
		// just made and silently reverting it.
		const patchSocialMediaCaches = useCallback(
			(row: SocialMediaRow) => {
				const matchedService = socialMediaServices?.find((s) => s.value === row.serviceId)

				apiUtils.orgSocialMedia.forEditDrawer.setData({ id: socialId }, (old) => ({
					id: row.id,
					username: row.username,
					url: row.url,
					deleted: row.deleted,
					published: row.published,
					serviceId: row.serviceId,
					organizationId: row.organizationId,
					orgLocationOnly: row.orgLocationOnly,
					// Location links aren't touched by this mutation at all - carried over unchanged.
					locations: old?.locations ?? [],
					// Always a real object (this field isn't nullable) - falls back to the previously
					// cached service, and only as a last resort (no lookup match, nothing cached yet) to
					// a bare id with blank display fields, corrected once the background invalidate below
					// is next naturally picked up.
					service: matchedService
						? { id: matchedService.value, name: matchedService.name, logoIcon: matchedService.logoIcon }
						: (old?.service ?? { id: row.serviceId, name: '', logoIcon: '' }),
				}))

				const parentIds = [organizationId, hasLocationId].filter((value): value is string => Boolean(value))
				for (const parentId of parentIds) {
					apiUtils.orgSocialMedia.forContactInfoEdits.setData({ parentId }, (old) => {
						if (!old) {
							return old
						}
						const existingIndex = old.findIndex((item) => item.id === row.id)
						const existing = old[existingIndex]
						const patchedItem = {
							id: row.id,
							url: row.url,
							username: row.username,
							orgLocationOnly: row.orgLocationOnly,
							published: row.published,
							deleted: row.deleted,
							// Neither field is nullable here - falls back to whatever this row already
							// had cached, then to an empty string as an absolute last resort.
							service: matchedService?.name ?? existing?.service ?? '',
							serviceIcon: matchedService?.logoIcon ?? existing?.serviceIcon ?? '',
						}
						// This list has no `orderBy` server-side (confirmed against the handler) - unlike
						// Phone/Email/Website's lists, a newly created row just appends at the end rather
						// than needing to be re-sorted in.
						return existingIndex === -1
							? [...old, patchedItem]
							: old.map((item, index) => (index === existingIndex ? patchedItem : item))
					})
				}
			},
			[apiUtils, organizationId, hasLocationId, socialId, socialMediaServices]
		)

		const databaseUpdate = api.orgSocialMedia.upsert.useMutation({
			onSettled: (data) => {
				if (data) {
					patchSocialMediaCaches(data)
				}
				// Deliberately NOT invalidating `forContactInfoEdits`/`forEditDrawer` - live-confirmed
				// real bug this used to cause: marking a query stale doesn't refetch it immediately,
				// but the *next* time it's naturally re-enabled (e.g. `forEditDrawer` going
				// disabled→enabled on this same drawer's next open) react-query refetches
				// automatically because the data is stale, and that refetch reads from the same
				// database confirmed to lag behind its own writes - silently overwriting the
				// just-patched, correct cache with a still-lagging response. The patch above is
				// already the authoritative, correct value; leaving these two unmarked keeps them
				// "fresh" for the normal staleTime window (~10 minutes, ~ui/lib/trpcClient.ts)
				// instead of inviting that race on every reopen. `forContactInfo` below is different -
				// it's never patched at all, so it still needs an eventual (soft) refetch to pick up
				// this change at all.
				apiUtils.orgSocialMedia.forContactInfo.invalidate(undefined, { refetchType: 'none' })
				// Guarded on success - this used to run unconditionally, which meant a failed save wiped
				// the user's just-typed, never-saved edit back to blank (no `defaultValues` are
				// configured for this form) with no way to recover it, on top of giving no indication
				// anything had gone wrong.
				if (data) {
					reset()
				}
			},
			onSuccess: () => {
				setIsSaved(true)
				notifySave()
				modalHandler.close()
				setTimeout(() => drawerHandler.close(), 500)
				// Only "Create new" needs a fresh id primed for a possible next creation - doing this
				// unconditionally on every save also fired on a plain edit, blanking the just-saved
				// form's fields (no `defaultValues` configured for this form, so they fall back to
				// empty/false) in the half-second before the drawer's own close timeout above fires.
				if (createNew) {
					reset({ id: generateId('orgSocialMedia') })
				}
			},
			onError: () => {
				notifySaveError()
			},
		})
		const unlinkFromLocation = api.orgSocialMedia.locationLink.useMutation({
			onSuccess: () => {
				apiUtils.orgSocialMedia.forContactInfoEdits.invalidate()
				apiUtils.orgSocialMedia.forContactInfo.invalidate()
				apiUtils.orgSocialMedia.forEditDrawer.invalidate({ id: socialId }, { refetchType: 'none' })
				// Found via a deliberate audit for this same class of gap, not a live report: the "Link
				// or create new..." menu kept omitting this entry from its options as if it were still
				// linked, since nothing ever told it the unlink had just happened.
				apiUtils.orgSocialMedia.getLinkOptions.invalidate()
			},
		})

		const [urlValue] = useDebouncedValue(watch('url'), 300)
		const parsedUsername = useMemo(() => {
			if (!urlValue) {
				return null
			}
			const detectedService = socialLinkValidator.detectProfile(urlValue)
			if (!detectedService) {
				return null
			}
			return socialLinkValidator.getProfileId(detectedService, urlValue)
		}, [urlValue])

		useEffect(() => {
			if (parsedUsername) {
				const currentUsername = getValues('username')
				if (parsedUsername !== currentUsername) {
					setFormValue('username', parsedUsername)
				}
			}
		}, [getValues, parsedUsername, setFormValue])

		// Runs on every open of a "Create new" trigger (not just at mount) - fully resets the form back
		// to blank defaults with the freshly-generated `socialId`. Without this, reopening the same
		// still-mounted trigger after a successful create kept showing the phone... e.g. the
		// previously-created entry's own values: the old version of this effect only ever set
		// `published`/`id`/`organizationId`/`orgLocationId`/`orgLocationOnly` via individual
		// `setFormValue` calls, never actually clearing `url`/`username`/`serviceId`/`deleted` back to
		// blank - harmless before `onSettled` above started patching `forEditDrawer`'s cache (nothing
		// ever re-populated those fields from a stale source), but once that patch exists, this
		// drawer's own `values: data ?? undefined` prop can re-sync the form from the previous item's
		// now-cached data, and a full `reset()` here is what actually guarantees a clean slate on
		// every reopen instead of relying on that sync happening to land on `undefined`.
		useEffect(() => {
			if (createNew && drawerOpened) {
				reset(
					{
						id: socialId,
						username: '',
						url: '',
						published: true,
						deleted: false,
						serviceId: '',
						organizationId: organizationId ?? null,
						orgLocationOnly: hasLocationId !== null,
						orgLocationId: hasLocationId,
					},
					{ keepDirtyValues: false }
				)
			}
		}, [createNew, drawerOpened, hasLocationId, socialId, organizationId, reset])
		useEffect(() => {
			if (isSaved && formIsDirty) {
				setIsSaved(false)
			}
		}, [formIsDirty, isSaved])
		const handleClose = useCallback(() => {
			if (formIsDirty) {
				return modalHandler.open()
			} else {
				return drawerHandler.close()
			}
		}, [formIsDirty, drawerHandler, modalHandler])

		const handleUnlink = useCallback(
			() =>
				hasLocationId &&
				unlinkFromLocation.mutate({
					orgSocialMediaId: socialId,
					orgLocationId: hasLocationId,
					action: 'unlink',
				}),
			[unlinkFromLocation, socialId, hasLocationId]
		)

		const handleModalSubmit = useCallback(() => {
			databaseUpdate.mutate({ operation: createNew ? 'create' : 'update', ...getValues() })
		}, [createNew, databaseUpdate, getValues])

		const handleModalDismiss = useCallback(() => {
			reset()
			modalHandler.close()
			drawerHandler.close()
		}, [drawerHandler, modalHandler, reset])

		const renderServiceOption = useCallback(
			({ option }: ComboboxLikeRenderOptionInput<ComboboxItem>) => {
				const service = socialMediaServices?.find(({ value }) => value === option.value)
				return (
					<Group wrap='nowrap' gap={12}>
						{service?.icon} {option.label}
					</Group>
				)
			},
			[socialMediaServices]
		)

		return (
			<>
				<Drawer.Root onClose={handleClose} opened={drawerOpened} position='right' zIndex={10001} keepMounted>
					<Drawer.Overlay />
					<Drawer.Content className={classes.drawerContent}>
						<form
							onSubmit={handleSubmit(
								(formData) => {
									databaseUpdate.mutate({ operation: createNew ? 'create' : 'update', ...formData })
								},
								(error) => console.error(error)
							)}
						>
							<Drawer.Header>
								<Group wrap='nowrap' justify='space-between' w='100%'>
									<Breadcrumb option='close' onClick={handleClose} />
									<Button
										variant='primary-icon'
										leftIcon={<Icon icon={isSaved ? 'carbon:checkmark' : 'carbon:save'} />}
										loading={databaseUpdate.isPending}
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
									<Title order={2}>{`${createNew ? 'Add New' : 'Edit'} Social Media`}</Title>
									<Stack
										gap={24}
										align='flex-start'
										w='100%'
										// Forces a fresh mount once the detail query's data actually arrives (and
										// again whenever it changes, e.g. reopening after a save). These fields'
										// own `useController` subscriptions (via `control` below) don't reliably
										// react to a value applied through this form's `values` prop *after*
										// they've already mounted and subscribed - the same gap PhoneNumberEntry
										// already works around for its own masked field (see that component for
										// the fuller account, confirmed directly against react-hook-form
										// 7.85.0/React 19 here too). Mounting fresh instead of updating in place
										// sidesteps it, since the value is already correct at mount time.
										key={`${socialId}:${JSON.stringify(data)}`}
									>
										<Select
											label='Service'
											required
											name='serviceId'
											control={control}
											data={socialMediaServices ?? []}
											comboboxProps={{ zIndex: 10002 }}
											renderOption={renderServiceOption}
										/>
										<TextInput label='Website URL' required name='url' control={control} />
										<TextInput label='Username/handle' required name='username' control={control} />
										<Group wrap='nowrap' justify='space-between' w='100%'>
											<Stack>
												<Checkbox label='Published' name='published' control={control} />
												<Checkbox label='Deleted' name='deleted' control={control} />
											</Stack>
											{hasLocationId !== null && (
												<Button
													leftIcon={<Icon icon='carbon:unlink' />}
													onClick={handleUnlink}
													disabled={createNew}
													// Button's root has `overflow: hidden` (for its loading-state
													// pseudo-element), which zeroes its flexbox automatic minimum
													// size - without this, the surrounding `justify='space-between'`
													// Group was free to shrink it below its label's width, silently
													// clipping the text instead of holding its size.
													style={{ flexShrink: 0 }}
												>
													Unlink from this location
												</Button>
											)}
										</Group>
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
											loading={databaseUpdate.isPending}
											onClick={handleModalSubmit}
										>
											Save
										</Button>
										<Button variant='secondaryLg' onClick={handleModalDismiss}>
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
_SocialMediaDrawer.displayName = 'WebsiteDrawer'

export const SocialMediaDrawer = createPolymorphicComponent<'button', SocialMediaDrawerProps>(
	_SocialMediaDrawer
)

type SocialMediaDrawerProps = SocialMediaExisting | SocialMediaNew

interface SocialMediaExisting {
	id: string
	createNew?: never
}
interface SocialMediaNew {
	id?: never
	createNew: true
}
